/*
 * SPDX-FileCopyrightText: 2026 Telito Contributors
 *
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

import { BleManager, Device, State } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';
import { fromByteArray } from 'base64-js';

// Single shared BLE manager (lightweight). All GATT work is behind this
// tiny wrapper so UI stays dumb and testable.
//
// TV remote profile: we connect to the TV's BLE remote service and write
// HID key codes. Real key UUIDs differ per vendor; this wrapper exposes a
// generic `sendKey(code)` that maps to the standard HID consumer-control
// codes so Samsung/LG/Sony/AndroidTV all work via notifications.

let manager: BleManager | null = null;

export function getBleManager(): BleManager {
  if (!manager) manager = new BleManager();
  return manager;
}

export async function ensureBlePermissions(): Promise<boolean> {
  try {
    const m = getBleManager();
    const state = await m.state();
    if (state === State.PoweredOff) return false;
    if (Platform.OS === 'android') {
      const api = Platform.Version as number;
      if (api >= 31) {
        const res = await PermissionsAndroid.requestMultiple([
          'android.permission.BLUETOOTH_SCAN' as never,
          'android.permission.BLUETOOTH_CONNECT' as never,
        ]);
        return Object.values(res).every((v) => v === 'granted');
      }
      const fineLocation = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
      if (!fineLocation) return false;
      const res = await PermissionsAndroid.request(fineLocation);
      return res === 'granted';
    }
    return true; // iOS handles permission via Info.plist prompt
  } catch {
    return false;
  }
}

// Standard HID consumer-control codes sent to TV (subset for a simplified, accessible UI).
export const KEY_CODES: Record<string, number[]> = {
  POWER: [0x30],
  HOME: [0x40],
  BACK: [0x42],
  OK: [0x41],
  UP: [0x43],
  DOWN: [0x44],
  LEFT: [0x45],
  RIGHT: [0x46],
  VOL_UP: [0xe9],
  VOL_DOWN: [0xea],
  MUTE: [0xe2],
  CH_UP: [0x9c],
  CH_DOWN: [0x9d],
};

// Cache of the characteristic that accepted a write, per device id. Service
// discovery over BLE is slow enough to be felt between keypresses on the
// low-RAM phones this app targets.
const writeTargets = new Map<string, { service: string; characteristic: string }>();

export function forgetWriteTarget(deviceId: string): void {
  writeTargets.delete(deviceId);
}

async function findWriteTarget(
  device: Device
): Promise<{ service: string; characteristic: string } | null> {
  const cached = writeTargets.get(device.id);
  if (cached) return cached;
  const services = await device.services();
  for (const s of services) {
    try {
      const chars = await device.characteristicsForService(s.uuid);
      const writable = chars.find((c) => c.isWritableWithoutResponse || c.isWritableWithResponse);
      if (writable) {
        const target = { service: s.uuid, characteristic: writable.uuid };
        writeTargets.set(device.id, target);
        return target;
      }
    } catch {
      // try next service
    }
  }
  return null;
}

// Throws if the key could not be delivered, so callers can tell the user the
// truth instead of showing a confirmation for a write that never landed.
export async function sendKeyToDevice(
  device: Device,
  key: keyof typeof KEY_CODES
): Promise<void> {
  const bytes = KEY_CODES[key];
  if (!bytes) throw new Error(`Unknown key: ${String(key)}`);
  // react-native-ble-plx takes base64. Hermes has no global Buffer, so encode
  // via base64-js rather than relying on a polyfill that may not be loaded.
  const data = fromByteArray(Uint8Array.from(bytes));

  const target = await findWriteTarget(device);
  if (!target) throw new Error('No writable characteristic on device');

  try {
    await device.writeCharacteristicWithResponseForService(
      target.service,
      target.characteristic,
      data
    );
  } catch {
    try {
      await device.writeCharacteristicWithoutResponseForService(
        target.service,
        target.characteristic,
        data
      );
    } catch (err) {
      // A cached target can go stale after a reconnect; drop it so the next
      // press rediscovers rather than failing forever against a dead handle.
      forgetWriteTarget(device.id);
      throw err;
    }
  }
}
