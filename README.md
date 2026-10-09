# Telito — telito.app

Super-simple, accessible TV remote for elderly people. Big buttons, 3-step setup, works offline. Source-available, near-zero running cost.

## Stack (why)

| Choice | Why (for this brief) |
|---|---|
| **Expo + React Native + TypeScript** | One JS codebase for iOS+Android, supports Android 7+ / iOS 14+ (old phones), Hermes = fast on 1GB RAM. Rejected Flutter (bigger binary, smaller contributor pool), rejected PWA (iOS Safari has no Web Bluetooth — can't do BLE). |
| **expo-router** | File-based nav = onboarding flow is just files in `app/onboarding/`. |
| **react-native-ble-plx** | Mature BLE, works on old OS, no native code to maintain. |
| **zustand + AsyncStorage + SecureStore** | 1KB store, fully offline (no backend = $0/mo). Device IDs in SecureStore, names in AsyncStorage. Multiple remotes supported. |
| **i18next + expo-localization** | Static JSON bundles, no network/ICU. Add a language: `npm run add-language -- pt`. Ships EN/ES/FR/DE. |
| **No UI kit, no backend, no analytics** | Keeps APK <15MB, fast on low compute, secure by default, no GDPR burden. |

## Accessibility (elderly-first)

- 72px touch targets (WCAG AAA), 22sp base font, scales to 200%
- 7:1 contrast, dark high-contrast mode, visible focus, no timed gestures
- Every button: `accessibilityRole` + localized `accessibilityLabel` + hint
- Haptic confirmation on press, `accessibilityLiveRegion` for status
- 6 buttons above the fold; D-pad hidden behind "more"

## Run

```bash
npm install
npx expo start        # scan QR with Expo Go, or:
npm run android / npm run ios
```

Old-device build: New Architecture + Hermes on, `minSdkVersion 24`.

## Onboarding

1. `app/onboarding/model.tsx` — type TV model → offline check in `lib/tv-database.ts`
2. `app/onboarding/connect.tsx` — BLE scan (12s, TV-names first) → tap Connect
3. `app/onboarding/save.tsx` — name it ("Living room") → saved, repeat for more TVs

## Security

- No account, no network calls, no tracking SDKs
- BLE bonding via OS; device IDs in SecureStore
- Permissions minimal: BLE scan/connect (+ location only on Android <12 for scanning)

## Contribute

- Read `CONTRIBUTING.md`, version per `VERSIONING.md`
- Add a TV: edit `lib/tv-database.ts` (one regex + brand)
- Add a language: `npm run add-language -- <code>` then translate the JSON
- Budget: GitHub Actions CI only, no servers. See `.github/workflows/ci.yml`.
- Landing page: `docs/index.html` (deployed to telito.app)

## Licence

| Part | Licence |
|---|---|
| Source code (`app/`, `lib/`, `store/`, `components/`, `theme.ts`, `scripts/`, `i18n/locales/`) | [PolyForm Noncommercial 1.0.0](LICENSE) |
| "Telito" name and app icon | Reserved — see [TRADEMARKS.md](TRADEMARKS.md) |

Free to use, read, modify, and redistribute for personal or noncommercial
purposes, with attribution preserved. Commercial use — selling the app,
bundling it in a paid product, or offering it as a paid service — needs a
separate agreement with the copyright holder.

Copyright (c) 2026 Telito Contributors. Third-party dependencies are listed
in [NOTICE](NOTICE); all are MIT-licensed. This is general information, not
legal advice — if you're planning a commercial use, a lawyer should review
the licence first.

### Commercial use

Want to sell Telito, host it as a paid service, or ship it inside a paid
product? Open an issue or reach out — commercial licensing is available on
a case-by-case basis.
