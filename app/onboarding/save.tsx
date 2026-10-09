/*
 * SPDX-FileCopyrightText: 2026 Telito Contributors
 *
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { BigButton } from '../../components/BigButton';
import { useRemotes } from '../../store/remotes';
import { Colors, Sizes } from '../../theme';

// Step 3: name + save. Multiple remotes allowed ("Living room", "Bedroom").

export default function SaveScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const { model, brand, deviceId } = useLocalSearchParams<{
    model: string;
    brand: string;
    deviceId: string;
  }>();
  const [name, setName] = useState('');
  const addRemote = useRemotes((s) => s.addRemote);

  const save = async () => {
    const remote = await addRemote({
      name: name.trim() || String(model) || 'TV',
      tvModel: String(model),
      brand: String(brand),
      deviceId: String(deviceId),
    });
    router.replace(`/remote/${remote.id}`);
  };

  return (
    <View style={[styles.wrap, { backgroundColor: c.background }]}>
      <Text style={[styles.step, { color: c.text }]}>{t('setup.step3')}</Text>
      <Text style={[styles.label, { color: c.text }]}>{t('setup.name_label')}</Text>
      <TextInput
        style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.surface }]}
        placeholder={t('setup.name_placeholder')}
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
        returnKeyType="done"
        accessibilityLabel={t('setup.name_label')}
        testID="remote-name-input"
      />
      <BigButton label={t('setup.save')} accessibilityLabel={t('setup.save')} icon="💾" onPress={save} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20 },
  step: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  label: { fontSize: 26, fontWeight: '800', marginBottom: 12 },
  input: { fontSize: 24, borderWidth: 3, borderRadius: Sizes.radius, padding: 16, minHeight: Sizes.minTouch },
});
