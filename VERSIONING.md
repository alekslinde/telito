# Versioning — Telito

Strict [SemVer](https://semver.org): `MAJOR.MINOR.PATCH` (e.g. `1.2.3`).

## What bumps what

| Change | Bump | Example |
|---|---|---|
| Fix, TV database entry, translation, a11y fix | **PATCH** | `1.0.0` → `1.0.1` |
| New feature, new screen, new button, new language | **MINOR** | `1.0.1` → `1.1.0` |
| Breaking: drops an OS, changes storage format, removes a feature | **MAJOR** | `1.1.0` → `2.0.0` |
| Docs, CI, comments only | **none** | no bump, say so in PR |

## How to release (maintainer, 3 steps)

1. Bump in **both** files (they must match):
   - `package.json` → `"version"`
   - `app.json` → `expo.version`, Android `versionCode` +1, iOS `buildNumber` +1
2. Tag: `git tag vX.Y.Z && git push --tags`
3. Build: `eas build --platform all` (free tier). GitHub Action typechecks + tests on every push.

## Rules

- Never bump major without opening an issue first (users who rely on a stable, predictable flow — elderly users among them — are hit hardest by surprises).
- Never reset `versionCode` / `buildNumber` — app stores reject re-used numbers.
- One version per PR. If in doubt, pick PATCH and let the maintainer adjust.
