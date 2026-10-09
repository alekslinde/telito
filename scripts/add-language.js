/*
 * SPDX-FileCopyrightText: 2026 Telito Contributors
 *
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

// Adds a new language in <5 min: `npm run add-language -- pt`
// Copies i18n/locales/en.json -> <lang>.json and registers it in i18n/index.ts
const fs = require('fs');
const path = require('path');

const lang = (process.argv[2] || '').toLowerCase().slice(0, 5);
if (!/^[a-z]{2}(-[a-z]{2})?$/.test(lang)) {
  console.error('Usage: npm run add-language -- <code>   e.g. pt, it, nl, uk');
  process.exit(1);
}
const root = path.join(__dirname, '..');
const src = path.join(root, 'i18n', 'locales', 'en.json');
const dst = path.join(root, 'i18n', 'locales', `${lang}.json`);
if (fs.existsSync(dst)) {
  console.error(`Already exists: i18n/locales/${lang}.json`);
  process.exit(1);
}
fs.copyFileSync(src, dst);

const idx = path.join(root, 'i18n', 'index.ts');
let s = fs.readFileSync(idx, 'utf8');
s = s.replace(
  `import en from './locales/en.json';`,
  `import en from './locales/en.json';\nimport ${lang.replace(/-/g, '_')} from './locales/${lang}.json';`
);
s = s.replace(
  /  en: \{ translation: en \},/,
  `  en: { translation: en },\n  ${lang.replace(/-/g, '_')}: { translation: ${lang.replace(/-/g, '_')} },`
);
// fix resources keys: keep simple mapping lang code -> import
s = s.replace(`${lang.replace(/-/g, '_')}: { translation`, `${lang}: { translation`);
console.log(`Created i18n/locales/${lang}.json — now translate the values (keep the keys).`);
fs.writeFileSync(idx, s);
console.log('Registered in i18n/index.ts. Test: npx expo start, change phone language.');
