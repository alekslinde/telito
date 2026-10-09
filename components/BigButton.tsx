/*
 * SPDX-FileCopyrightText: 2026 Telito Contributors
 *
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

import React from 'react';
import { Pressable, Text, StyleSheet, useColorScheme, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Sizes } from '../theme';

// The only button in the app. Huge, high-contrast, screen-reader labelled.
// 72px min target, 22sp min font, visible focus ring, haptic confirmation.

type Props = {
  label: string;
  accessibilityLabel: string;
  accessibilityHint?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: string; // big emoji/text glyph — no icon font = smaller bundle, works offline
  style?: ViewStyle;
  testID?: string;
};

export function BigButton({ label, accessibilityLabel, accessibilityHint, onPress, variant = 'primary', icon, style, testID }: Props) {
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? Colors.dark : Colors.light;

  const bg =
    variant === 'primary' ? c.primary : variant === 'danger' ? c.danger : c.surface;
  const fg =
    variant === 'primary' ? c.primaryText : variant === 'danger' ? '#FFFFFF' : c.text;

  return (
    <Pressable
      testID={testID}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg, borderColor: c.border, opacity: pressed ? 0.85 : 1 },
        variant === 'secondary' && { borderWidth: 3 },
        style,
      ]}
    >
      {icon ? <Text style={[styles.icon, { color: fg }]}>{icon}</Text> : null}
      <Text style={[styles.label, { color: fg }]} maxFontSizeMultiplier={2.0}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: Sizes.bigButtonHeight,
    minWidth: '100%',
    borderRadius: Sizes.radius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  icon: { fontSize: 34, marginBottom: 2 },
  label: { fontSize: Sizes.fontBase, fontWeight: '700', textAlign: 'center' },
});
