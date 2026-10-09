/*
 * SPDX-FileCopyrightText: 2026 Telito Contributors
 *
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, useColorScheme, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Device } from 'react-native-ble-plx';
import { BigButton } from '../../components/BigButton';
import { ensureBlePermissions, getBleManager } from '../../lib/ble';
import { Colors } from '../../theme';

// Step 2: BLE scan + connect. Filters for TV-like names, 15s timeout
// (battery-friendly on old phones), one-tap connect.

export default function ConnectScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const { model, brand } = useLocalSearchParams<{ model: string; brand: string }>();

  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedId, setConnectedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const scanTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopScan = useCallback(() => {
    if (scanTimeout.current) {
      clearTimeout(scanTimeout.current);
      scanTimeout.current = null;
    }
    getBleManager().stopDeviceScan();
  }, []);

  const scan = async () => {
    setError('');
    setDevices([]);
    const ok = await ensureBlePermissions();
    if (!ok) {
      setError(t('setup.no_devices'));
      return;
    }
    stopScan();
    setScanning(true);
    const found = new Map<string, Device>();
    const manager = getBleManager();
    manager.startDeviceScan(null, { allowDuplicates: false }, (err, dev) => {
      if (err) {
        setError(t('setup.no_devices'));
        setScanning(false);
        return;
      }
      if (dev && (dev.name || dev.localName)) {
        const n = (dev.name || dev.localName || '').toLowerCase();
        // Prefer TV-like names; still show everything so elderly users see *something*.
        if (!found.has(dev.id)) {
          found.set(dev.id, dev);
          const tvFirst = [...found.values()].sort((a, b) => {
            const at = /tv|samsung|lg|sony|bravia|philips|tcl|fire/i.test(a.name || '');
            const bt = /tv|samsung|lg|sony|bravia|philips|tcl|fire/i.test(b.name || '');
            return Number(bt) - Number(at);
          });
          setDevices(tvFirst.slice(0, 8));
        }
      }
    });
    // 12s scan then stop — saves battery on old devices.
    scanTimeout.current = setTimeout(() => {
      scanTimeout.current = null;
      manager.stopDeviceScan();
      setScanning(false);
    }, 12000);
  };

  useEffect(() => {
    // Effect callbacks must be synchronous: returning a promise would make the
    // cleanup unreachable and leave the scan running after unmount.
    void scan();
    return stopScan;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = async (dev: Device) => {
    stopScan();
    setScanning(false);
    try {
      const connected = await dev.connect({ timeout: 10000 });
      await connected.discoverAllServicesAndCharacteristics();
      setConnectedId(connected.id);
    } catch {
      setError(t('setup.no_devices'));
    }
  };

  return (
    <View style={[styles.wrap, { backgroundColor: c.background }]}>
      <Text style={[styles.step, { color: c.text }]}>{t('setup.step2')}</Text>
      {scanning && (
        <View style={styles.row}>
          <ActivityIndicator size="large" />
          <Text style={[styles.body, { color: c.text }]}>{t('setup.scanning')}</Text>
        </View>
      )}
      {!scanning && devices.length === 0 && !connectedId && (
        <Text style={[styles.body, { color: c.text }]}>{t('setup.no_devices')}</Text>
      )}
      {connectedId ? (
        <View>
          <Text style={[styles.ok, { color: c.text }]}>✅ {t('setup.connected')}</Text>
          <BigButton
            label={t('setup.continue')}
            accessibilityLabel={t('setup.continue')}
            icon="→"
            onPress={() =>
              router.push({
                pathname: '/onboarding/save',
                params: { model: String(model), brand: String(brand), deviceId: connectedId },
              })
            }
          />
        </View>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(d) => d.id}
          renderItem={({ item }) => (
            <View style={[styles.card, { borderColor: c.border, backgroundColor: c.surface }]}>
              <Text style={[styles.name, { color: c.text }]}>{item.name || item.localName || item.id}</Text>
              <BigButton
                label={t('setup.connect')}
                accessibilityLabel={`${t('setup.connect')} ${item.name || ''}`}
                icon="🔗"
                onPress={() => connect(item)}
              />
            </View>
          )}
          ListFooterComponent={
            !scanning ? (
              <BigButton
                variant="secondary"
                label={t('setup.scan')}
                accessibilityLabel={t('setup.scan')}
                icon="↻"
                onPress={scan}
              />
            ) : null
          }
        />
      )}
      {!!error && <Text style={[styles.body, { color: c.text }]}>{error}</Text>}
      <BigButton variant="secondary" label={t('setup.back')} accessibilityLabel={t('setup.back')} onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20 },
  step: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  body: { fontSize: 22, lineHeight: 30, marginVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  card: { borderWidth: 2, borderRadius: 16, padding: 14, marginVertical: 6 },
  name: { fontSize: 24, fontWeight: '700', marginBottom: 6 },
  ok: { fontSize: 28, fontWeight: '800', marginVertical: 12 },
});
