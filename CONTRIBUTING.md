# Contributing to Telito

Thanks for helping keep TV simple for elderly people. Small PRs win.

## Setup (2 min)

```bash
npm install
npx expo start
```

No backend, no keys, no account. Everything runs offline.

## What to work on

- **Add a TV:** edit `lib/tv-database.ts` — one regex + brand. Test with the model string from the issue.
- **Add a language:** `npm run add-language -- pt`, translate `i18n/locales/pt.json` (keep keys), test by switching phone language.
- **Fixes:** keep them tiny and focused. One issue = one PR.

## Rules (please respect these)

1. **Elderly-first:** min 72px touch targets, 22sp+ fonts, 7:1 contrast. No tiny text, no timed gestures, no extra screens.
2. **Lightweight:** no new dependencies without asking first. This app must stay <15MB and run on Android 7 / iOS 14 with 1GB RAM. Prefer deleting code over adding it.
3. **Accessible:** every button needs `accessibilityRole="button"` + localized `accessibilityLabel`. Test with VoiceOver / TalkBack.
4. **Offline + private:** no network calls, no analytics, no tracking SDKs. Device IDs go to SecureStore only.
5. **i18n:** never hardcode user-facing text. Add English in `en.json`, other languages fall back to English until translated.

## PR checklist

- [ ] Tested on a real device or Expo Go (old OS if possible)
- [ ] Screen reader reads every new button sensibly
- [ ] No hardcoded strings (all in `i18n/locales/en.json`)
- [ ] Version bump per `VERSIONING.md` (or say why not)
- [ ] New source files carry the SPDX header (see below)

## Licensing

This project is licensed under the [PolyForm Noncommercial License](LICENSE)
— free to use and modify for personal/noncommercial purposes, with
attribution preserved; commercial use needs a separate agreement (see the
README). "Telito" the name and the app icon are reserved — see
[TRADEMARKS.md](TRADEMARKS.md).

By submitting a pull request, you agree your contribution is licensed under
the same terms as the rest of the project (inbound = outbound). There's no
CLA to sign.

New source files need this header at the top, before any other code:

```ts
// SPDX-FileCopyrightText: 2026 Telito Contributors
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
```

`reuse lint` runs in CI and will fail a PR that's missing it.

Questions? Open an issue — maintainer: Aleks Linde.
