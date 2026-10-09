/*
 * SPDX-FileCopyrightText: 2026 Telito Contributors
 *
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { BigButton } from '../../components/BigButton';
import { checkCompatibility } from '../../lib/tv-database';
import { Colors, Sizes } from '../../theme';

// Step 1: identify TV model + instant compatibility check (offline, local DB).
// One text field, one big button — nothing else to confuse.

export default function ModelScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const [model, setModel] = useState('');
  const [checked, setChecked] = useState<ReturnType<typeof checkCompatibility> | null>(null);

  const check = () => setChecked(checkCompatibility(model));

  return (
    <View style={[styles.wrap, { backgroundColor: c.background }]}>
      <Text style={[styles.step, { color: c.text }]}>{t('setup.step1')}</Text>
      <Text style={[styles.label, { color: c.text }]}>{t('setup.tv_label')}</Text>
      <TextInput
        style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.surface }]}
        placeholder={t('setup.tv_placeholder')}
        placeholderTextColor="#888"
        value={model}
        onChangeText={setModel}
        autoCapitalize="characters"
        autoCorrect={false}
        returnKeyType="done"
        accessibilityLabel={t('setup.tv_label')}
        accessibilityHint={t('setup.tv_help')}
        testID="tv-model-input"
      />
      <Text style={[styles.help, { color: c.text }]}>{t('setup.tv_help')}</Text>
      <BigButton label={t('setup.check')} accessibilityLabel={t('setup.check')} icon="🔍" onPress={check} />

      {checked && checked.brand !== '' && (
        <View
          style={[styles.result, { borderColor: c.border, backgroundColor: c.surface }]}
          accessibilityLiveRegion="polite"
        >
          <Text style={[styles.resultText, { color: c.text }]}>
            {checked.compatible
              ? t('setup.compatible_yes', { brand: checked.brand })
              : t('setup.compatible_no')}
          </Text>
          <Text style={[styles.help, { color: c.text }]}>{t(checked.noteKey as never)}</Text>
          {!!t(checked.pairHintKey as never) && (
            <Text style={[styles.help, { color: c.text }]}>{t(checked.pairHintKey as never)}</Text>
          )}
          {checked.compatible && (
            <BigButton
              label={t('setup.continue')}
              accessibilityLabel={t('setup.continue')}
              icon="→"
              onPress={() =>
                router.push({
                  pathname: '/onboarding/connect',
                  params: { model, brand: checked.brand },
                })
              }
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20 },
  step: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  label: { fontSize: 26, fontWeight: '800', marginBottom: 12 },
  input: {
    fontSize: 24,
    borderWidth: 3,
    borderRadius: Sizes.radius,
    padding: 16,
    minHeight: Sizes.minTouch,
  },
  help: { fontSize: 20, lineHeight: 28, marginVertical: 10 },
  result: { borderWidth: 2, borderRadius: Sizes.radius, padding: 14, marginTop: 10 },
  resultText: { fontSize: 22, fontWeight: '700' },
});
