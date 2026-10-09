/*
 * SPDX-FileCopyrightText: 2026 Telito Contributors
 *
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';

// Lightweight i18n: static JSON bundles, no network, no ICU polyfill
// (works on Hermes + Android 7). Add a language: copy en.json,
// translate values, import + add to resources. See scripts/add-language.js.

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
} as const;

const deviceLocales = Localization.getLocales();
const lng = deviceLocales[0]?.languageCode ?? 'en';
const supported = Object.keys(resources);
const initialLng = supported.includes(lng) ? lng : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: initialLng,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  // Keep it fast on old phones: no suspense, no async loading.
  react: { useSuspense: false },
});

export default i18n;
export const SUPPORTED_LANGS = supported;
