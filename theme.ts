/*
 * SPDX-FileCopyrightText: 2026 Telito Contributors
 *
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

import { StyleSheet } from 'react-native';

// Design tokens for elderly accessibility:
// - min touch target 72x72 (exceeds WCAG 2.2 AA 44px + AAA preference)
// - base font 22, titles 28-34, allows OS scaling to 200%
// - contrast ratio >= 7:1 (AAA). Pure black/white + yellow focus.
// - no thin fonts, no low-opacity text, no time-based gestures.

export const Colors = {
  light: {
    background: '#FFFFFF',
    surface: '#F2F2F2',
    text: '#000000',
    primary: '#005A00', // dark green on white = 7.5:1
    primaryText: '#FFFFFF',
    danger: '#B00000', // 7:1 on white
    focus: '#FFD600', // focus ring
    border: '#000000',
  },
  dark: {
    background: '#000000',
    surface: '#1A1A1A',
    text: '#FFFFFF',
    primary: '#4ADE80', // light green on black >10:1
    primaryText: '#000000',
    danger: '#FF6B6B',
    focus: '#FFD600',
    border: '#FFFFFF',
  },
} as const;

export const Sizes = {
  minTouch: 72,
  bigButtonHeight: 84,
  fontBase: 22,
  fontTitle: 30,
  fontHuge: 36,
  radius: 16,
  gap: 12,
};

export const sharedStyles = StyleSheet.create({
  focusRing: {
    borderWidth: 4,
  },
});
