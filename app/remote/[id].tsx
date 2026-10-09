/*
 * SPDX-FileCopyrightText: 2026 Telito Contributors
 *
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Device } from 'react-native-ble-plx';
import { BigButton } from '../../components/BigButton';
import { useRemotes } from '../../store/remotes';
import { getBleManager, sendKeyToDevice, forgetWriteTarget, KEY_CODES } from '../../lib/ble';
import { Colors, Sizes } from '../../theme';

// Elderly-first remote: 6 giant buttons above the fold
// (Power, Vol +/-, Ch +/-, Mute). D-pad collapsed behind "More buttons"
// so the first screen is never overwhelming.

export default function RemoteScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const remote = useRemotes((s) => s.remotes.find((r) => r.id === id));
  const [device, setDevice] = useState<Device | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [flash, setFlash] = useState(0);

  const reconnect = useCallback(async () => {
    if (!remote) return;
    try {
      const manager = getBleManager();
      const dev = await manager.connectToDevice(remote.deviceId, { timeout: 8000 });
      await dev.discoverAllServicesAndCharacteristics();
      setDevice(dev);
    } catch {
      setDevice(null);
    }
  }, [remote]);

  useEffect(() => {
    void reconnect();
  }, [reconnect]);

  useEffect(() => {
    if (flash === 0) return;
    const h = setTimeout(() => setFlash(0), 600);
    return () => clearTimeout(h);
  }, [flash]);

  const press = async (key: keyof typeof KEY_CODES) => {
    if (!device) {
      await reconnect();
      return;
    }
    try {
      await sendKeyToDevice(device, key);
    } catch {
      // Never report success for a key that did not land: someone who cannot
      // tell a broken app from a broken TV needs the failure stated plainly.
      forgetWriteTarget(device.id);
      setDevice(null);
      setFlash(0);
      return;
    }
    // Counter, not the key name: pressing the same key twice must retrigger
    // the confirmation rather than set an identical state value.
    setFlash((n) => n + 1);
  };

  if (!remote) {
    return (
      <View style={[styles.wrap, { backgroundColor: c.background }]}>
        <Text style={[styles.title, { color: c.text }]}>—</Text>
      </View>
    );
  }

  const btn = (
    key: keyof typeof KEY_CODES,
    labelKey: string,
    icon: string,
    variant: 'primary' | 'secondary' | 'danger' = 'primary'
  ) => (
    <BigButton
      key={key}
      label={t(labelKey as never)}
      accessibilityLabel={t(labelKey as never)}
      accessibilityHint={t('a11y.tap_hint')}
      icon={icon}
      variant={variant}
      onPress={() => press(key)}
    />
  );

  return (
    <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.wrap}>
      <Text style={[styles.title, { color: c.text }]} accessibilityRole="header">
        {remote.name}
      </Text>
      <Text style={[styles.sub, { color: c.text }]}>{remote.tvModel}</Text>

      {!device && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('remote.disconnected')}
          onPress={reconnect}
          style={[styles.banner, { borderColor: c.border, backgroundColor: c.surface }]}
        >
          <Text style={[styles.bannerText, { color: c.text }]}>⚠️ {t('remote.disconnected')}</Text>
        </Pressable>
      )}
      {flash !== 0 && (
        <Text style={[styles.flash, { color: c.text }]} accessibilityLiveRegion="polite">
          ✓ {t('remote.sent')}
        </Text>
      )}

      {btn('POWER', 'remote.power', '⏻', 'danger')}
      <View style={styles.twoCol}>
        <View style={{ flex: 1, marginRight: 6 }}>{btn('VOL_UP', 'remote.vol_up', '🔊')}</View>
        <View style={{ flex: 1, marginLeft: 6 }}>{btn('VOL_DOWN', 'remote.vol_down', '🔉')}</View>
      </View>
      <View style={styles.twoCol}>
        <View style={{ flex: 1, marginRight: 6 }}>{btn('CH_UP', 'remote.ch_up', '▲')}</View>
        <View style={{ flex: 1, marginLeft: 6 }}>{btn('CH_DOWN', 'remote.ch_down', '▼')}</View>
      </View>
      {btn('MUTE', 'remote.mute', '🔇', 'secondary')}

      <BigButton
        variant="secondary"
        label={showMore ? '▲ ▲ ▲' : '▼ ▼ ▼'}
        accessibilityLabel={showMore ? 'Hide extra buttons' : 'Show more buttons'}
        onPress={() => setShowMore((v) => !v)}
      />

      {showMore && (
        <View>
          <View style={styles.dpad}>
            <View style={styles.dpadRow}>
              {btn('UP', 'remote.up', '▲', 'secondary')}
            </View>
            <View style={styles.twoCol}>
              <View style={{ flex: 1, marginRight: 6 }}>{btn('LEFT', 'remote.left', '◀', 'secondary')}</View>
              <View style={{ flex: 1, marginHorizontal: 6 }}>{btn('OK', 'remote.ok', '✓')}</View>
              <View style={{ flex: 1, marginLeft: 6 }}>{btn('RIGHT', 'remote.right', '▶', 'secondary')}</View>
            </View>
            <View style={styles.dpadRow}>
              {btn('DOWN', 'remote.down', '▼', 'secondary')}
            </View>
          </View>
          <View style={styles.twoCol}>
            <View style={{ flex: 1, marginRight: 6 }}>{btn('BACK', 'remote.back', '↩', 'secondary')}</View>
            <View style={{ flex: 1, marginLeft: 6 }}>{btn('HOME', 'remote.home', '⌂', 'secondary')}</View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 40 },
  title: { fontSize: Sizes.fontHuge, fontWeight: '800' },
  sub: { fontSize: 20, marginBottom: 10 },
  banner: { borderWidth: 3, borderRadius: Sizes.radius, padding: 16, marginVertical: 8 },
  bannerText: { fontSize: 22, fontWeight: '700' },
  flash: { fontSize: 20, marginVertical: 4 },
  twoCol: { flexDirection: 'row' },
  dpad: { marginTop: 8 },
  dpadRow: {},
});
