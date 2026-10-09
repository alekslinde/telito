/*
 * SPDX-FileCopyrightText: 2026 Telito Contributors
 *
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

// Local TV compatibility database — no backend, zero cost, works offline.
// BLE remote works with TVs that accept BLE HID / BLE remote profile.
// Wi-Fi-only models (old Chromecast-only, some Roku sticks) are marked incompatible
// with a plain-language reason shown during onboarding.

export type Compatibility = {
  compatible: boolean;
  protocol: 'BLE-HID' | 'BLE-vendor' | 'IR-only' | 'wifi-only' | 'unknown';
  noteKey: string; // i18n key in `compat` namespace
  pairHintKey: string;
};

type BrandEntry = {
  match: RegExp;
  brand: string;
  years: string;
  result: Compatibility;
};

// Keep this list small + editable by contributors. Matching is case-insensitive
// substring/regex on what the user types, e.g. "Samsung UE43AU7170" or "LG 43UP".
export const TV_DATABASE: BrandEntry[] = [
  {
    match: /samsung/i,
    brand: 'Samsung',
    years: '2018+ (Tizen 4.0+)',
    result: {
      compatible: true,
      protocol: 'BLE-vendor',
      noteKey: 'compat.samsung_ok',
      pairHintKey: 'compat.samsung_hint',
    },
  },
  {
    match: /lg/i,
    brand: 'LG',
    years: '2018+ (webOS 4.0+)',
    result: {
      compatible: true,
      protocol: 'BLE-vendor',
      noteKey: 'compat.lg_ok',
      pairHintKey: 'compat.lg_hint',
    },
  },
  {
    match: /sony|bravia/i,
    brand: 'Sony Bravia',
    years: '2019+ (Android TV 9+)',
    result: {
      compatible: true,
      protocol: 'BLE-HID',
      noteKey: 'compat.sony_ok',
      pairHintKey: 'compat.sony_hint',
    },
  },
  {
    match: /philips/i,
    brand: 'Philips',
    years: '2019+ (Android TV / Titan OS)',
    result: {
      compatible: true,
      protocol: 'BLE-HID',
      noteKey: 'compat.philips_ok',
      pairHintKey: 'compat.philips_hint',
    },
  },
  {
    match: /tcl|hisense|xiaomi|mi tv|oneplus|nokia tv/i,
    brand: 'Android TV / Google TV',
    years: '2019+',
    result: {
      compatible: true,
      protocol: 'BLE-HID',
      noteKey: 'compat.androidtv_ok',
      pairHintKey: 'compat.androidtv_hint',
    },
  },
  {
    match: /fire ?tv|toshiba fire|insignia fire/i,
    brand: 'Fire TV',
    years: '2018+',
    result: {
      compatible: true,
      protocol: 'BLE-vendor',
      noteKey: 'compat.firetv_ok',
      pairHintKey: 'compat.firetv_hint',
    },
  },
  {
    match: /roku/i,
    brand: 'Roku',
    years: 'all sticks',
    result: {
      compatible: false,
      protocol: 'wifi-only',
      noteKey: 'compat.roku_no',
      pairHintKey: 'compat.roku_hint',
    },
  },
  {
    match: /panasonic/i,
    brand: 'Panasonic',
    years: 'pre-2020 IR models',
    result: {
      compatible: false,
      protocol: 'IR-only',
      noteKey: 'compat.panasonic_no',
      pairHintKey: 'compat.panasonic_hint',
    },
  },
];

export function checkCompatibility(input: string): Compatibility & { brand: string } {
  const q = input.trim();
  if (!q) {
    return {
      compatible: false,
      protocol: 'unknown',
      noteKey: 'compat.unknown',
      pairHintKey: 'compat.unknown_hint',
      brand: '',
    };
  }
  for (const e of TV_DATABASE) {
    if (e.match.test(q)) return { ...e.result, brand: e.brand };
  }
  // Unknown model: assume try-BLE (most 2018+ TVs support it), be honest.
  return {
    compatible: true,
    protocol: 'BLE-HID',
    noteKey: 'compat.generic_ok',
    pairHintKey: 'compat.generic_hint',
    brand: q.slice(0, 40),
  };
}
