/// <reference types="node" />
/*
 * SPDX-FileCopyrightText: 2026 Telito Contributors
 *
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

// Zero-dependency tests: `npm test` (node:test, no jest).
// Covers lib/tv-database.ts — pure offline matching logic used in onboarding.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkCompatibility } from '../lib/tv-database.ts';

test('samsung matches BLE-vendor path', () => {
  const r = checkCompatibility('Samsung UE43AU7170');
  assert.equal(r.compatible, true);
  assert.equal(r.protocol, 'BLE-vendor');
  assert.equal(r.brand, 'Samsung');
});

test('matching is case-insensitive', () => {
  assert.equal(checkCompatibility('SAMSUNG').brand, 'Samsung');
  assert.equal(checkCompatibility('samsung').compatible, true);
});

test('lg matches', () => {
  const r = checkCompatibility('LG 43UP');
  assert.equal(r.compatible, true);
  assert.equal(r.brand, 'LG');
});

test('sony/bravia matches BLE-HID path', () => {
  for (const q of ['Sony X90K', 'Bravia 55']) {
    const r = checkCompatibility(q);
    assert.equal(r.compatible, true);
    assert.equal(r.protocol, 'BLE-HID');
    assert.equal(r.brand, 'Sony Bravia');
  }
});

test('philips, android-tv brands and fire tv match', () => {
  assert.equal(checkCompatibility('Philips 50PUS').brand, 'Philips');
  assert.equal(checkCompatibility('TCL 55S535').brand, 'Android TV / Google TV');
  assert.equal(checkCompatibility('Fire TV Stick').brand, 'Fire TV');
  assert.equal(checkCompatibility('FireTV Cube').brand, 'Fire TV');
});

test('roku is incompatible (wifi-only)', () => {
  const r = checkCompatibility('Roku Express');
  assert.equal(r.compatible, false);
  assert.equal(r.protocol, 'wifi-only');
});

test('panasonic is incompatible (IR-only)', () => {
  const r = checkCompatibility('Panasonic TX-50');
  assert.equal(r.compatible, false);
  assert.equal(r.protocol, 'IR-only');
});

test('empty input returns unknown with empty brand', () => {
  for (const q of ['', '   ']) {
    const r = checkCompatibility(q);
    assert.equal(r.compatible, false);
    assert.equal(r.protocol, 'unknown');
    assert.equal(r.brand, '');
  }
});

test('unknown brand assumes try-BLE and keeps user text as brand', () => {
  const r = checkCompatibility('Some Unknown Brand 123');
  assert.equal(r.compatible, true);
  assert.equal(r.protocol, 'BLE-HID');
  assert.equal(r.brand, 'Some Unknown Brand 123');
});

test('unknown brand is truncated to 40 chars', () => {
  const r = checkCompatibility(`  ${'x'.repeat(50)}  `);
  assert.equal(r.brand.length, 40);
});

test('leading/trailing whitespace is ignored for matching', () => {
  assert.equal(checkCompatibility('  lg  ').brand, 'LG');
});
