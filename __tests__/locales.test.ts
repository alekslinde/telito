/// <reference types="node" />
/*
 * SPDX-FileCopyrightText: 2026 Telito Contributors
 *
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

// Zero-dependency tests: `npm test` (node:test, no jest).
// Every locale must expose exactly the keys en.json has (no missing /
// untranslated-key crashes at runtime), with matching {{placeholders}}.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'i18n', 'locales');

function keysOf(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    keysOf(v, prefix ? `${prefix}.${k}` : k),
  );
}

function valueAt(obj: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>((acc, k) => (typeof acc === 'object' && acc !== null ? (acc as Record<string, unknown>)[k] : undefined), obj);
}

function placeholders(s: string): string[] {
  return [...s.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => String(m[1])).sort();
}

const files = readdirSync(root).filter((f) => f.endsWith('.json'));
assert.ok(files.includes('en.json'), 'en.json must exist');

const en = JSON.parse(readFileSync(join(root, 'en.json'), 'utf8')) as unknown;
const enKeys = new Set(keysOf(en));

for (const f of files) {
  if (f === 'en.json') continue;
  const lang = f.replace(/\.json$/, '');
  test(`${lang}: same keys as en`, () => {
    const loc = JSON.parse(readFileSync(join(root, f), 'utf8')) as unknown;
    const got = new Set(keysOf(loc));
    const missing = [...enKeys].filter((k) => !got.has(k));
    const extra = [...got].filter((k) => !enKeys.has(k));
    assert.deepEqual(missing, [], `missing keys in ${f}`);
    assert.deepEqual(extra, [], `extra keys in ${f}`);
  });

  test(`${lang}: same {{placeholders}} as en`, () => {
    const loc = JSON.parse(readFileSync(join(root, f), 'utf8')) as unknown;
    for (const k of enKeys) {
      const a = valueAt(en, k);
      const b = valueAt(loc, k);
      if (typeof a === 'string' && typeof b === 'string') {
        assert.deepEqual(placeholders(b), placeholders(a), `${f}:${k} placeholders`);
      }
    }
  });
}

test('en has the keys the app reads', () => {
  for (const k of ['setup.step2', 'setup.no_devices', 'setup.scan', 'setup.connect', 'setup.connected']) {
    assert.equal(typeof valueAt(en, k), 'string', k);
  }
});
