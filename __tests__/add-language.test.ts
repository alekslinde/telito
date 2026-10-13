/// <reference types="node" />
/*
 * SPDX-FileCopyrightText: 2026 Telito Contributors
 *
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

// Zero-dependency tests: `npm test` (node:test, no jest).
// scripts/add-language.js mutates the repo, so only the failure paths are
// exercised here (no files created, index.ts untouched).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const script = join(root, 'scripts', 'add-language.js');
const localesDir = join(root, 'i18n', 'locales');
const indexTs = join(root, 'i18n', 'index.ts');

function run(arg: string): { status: number; stderr: string } {
  try {
    execFileSync(process.execPath, [script, arg], { stdio: 'pipe', encoding: 'utf8' });
    return { status: 0, stderr: '' };
  } catch (err) {
    const e = err as { status?: number; stderr?: string };
    return { status: e.status ?? 1, stderr: String(e.stderr ?? '') };
  }
}

test('rejects invalid language codes without touching the repo', () => {
  const beforeFiles = readdirSync(localesDir).sort().join(',');
  const beforeIndex = readFileSync(indexTs, 'utf8');
  for (const bad of ['1', 'toolongcode', 'e']) {
    const r = run(bad);
    assert.equal(r.status, 1, `exit code for ${JSON.stringify(bad)}`);
    assert.match(r.stderr, /Usage/, 'prints usage');
  }
  assert.equal(readdirSync(localesDir).sort().join(','), beforeFiles);
  assert.equal(readFileSync(indexTs, 'utf8'), beforeIndex);
});

test('refuses an existing language without modifying index.ts', () => {
  const beforeIndex = readFileSync(indexTs, 'utf8');
  const r = run('en');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /Already exists/);
  assert.equal(readFileSync(indexTs, 'utf8'), beforeIndex);
});
