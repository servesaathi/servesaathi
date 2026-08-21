# Building for iOS — ServeSaathi

How to run this project on an iPhone/iPad (Expo SDK 56, React Native 0.85,
prebuild/CNG workflow — the `ios/` folder is **generated** and gitignored, same as `android/`).

---

## 1. Prerequisites (one-time setup)

| Tool | Version | Notes |
|------|---------|-------|
| macOS | Sonoma+ | iOS builds only work on a Mac |
| Xcode | 16+ | install from the Mac App Store (~12 GB) — Command Line Tools alone are NOT enough |
| CocoaPods | any recent | already installed (`pod --version`); otherwise `brew install cocoapods` |
| Apple ID | free or paid | free = run on your own device (app expires after 7 days); paid ($99/yr) = TestFlight + distribution |

After installing Xcode:

```bash
# Point the CLI tools at the full Xcode (required — currently they point at CommandLineTools)
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
# Open Xcode once so it installs the iOS platform support
```

Then add your Apple ID in **Xcode → Settings → Accounts → “+”**. This creates a free
“Personal Team” used for signing.

---

## 2. Generate the native project (when needed)

The `ios/` folder is generated from `app.json`. Regenerate whenever you change:
app name/bundle id, icons/splash, or any config-plugin entry (`expo-location`,
`expo-image-picker` permissions, etc.).

```bash
npx expo prebuild -p ios
```

This creates `ios/`, runs `pod install`, and bakes in the permission strings
(camera, photos, location) from `app.json`.

---

## 3. Run on a real device (development build)

1. Plug the iPhone in via USB (or same Wi-Fi with Xcode device pairing).
2. On the phone: **Settings → Privacy & Security → Developer Mode → On** (iOS 16+), reboot.
3. Trust the computer when prompted.

```bash
npx expo run:ios --device
```

Pick your phone from the list. First run will fail signing until you set the team:
open `ios/ServeSaathi.xcworkspace` in Xcode → target **ServeSaathi** →
**Signing & Capabilities** → check *Automatically manage signing* → select your
Personal Team. If the bundle id `com.anonymous.ServeSaathi` collides, change it in
`app.json` (`ios.bundleIdentifier`, e.g. `com.servesaathi.app`) and prebuild again.

4. On the phone, trust the developer cert: **Settings → General → VPN & Device
   Management → your Apple ID → Trust**.

The app installs with Metro attached — JS edits hot-reload; only config/native
changes need a rebuild.

> Free-account limits: the install expires after **7 days** (rerun `expo run:ios --device`
> to refresh), max 3 apps per device, and no push notifications.

Simulator (no Apple ID needed at all): `npx expo run:ios`.

---

## 4. Sharing with others / TestFlight (needs paid Apple Developer account)

The zero-config path is EAS Build — Expo's cloud service builds and signs remotely,
so teammates without this Mac setup can also trigger builds:

```bash
npm i -g eas-cli
eas login                       # Expo account
eas build:configure             # creates eas.json
eas build -p ios --profile production
eas submit -p ios               # uploads to App Store Connect / TestFlight
```

EAS walks you through Apple credentials on first run (it can create certs and
provisioning profiles for you). Testers then install via TestFlight.

Local alternative: Xcode → **Product → Archive** → Distribute (requires the same
paid account; more manual certificate management).

---

## 5. Gotchas specific to this repo

- **Native modules were added recently** (`expo-location`, camera permission for
  `expo-image-picker`) — any binary built before those changes will crash on the
  location/camera features. Always `npx expo prebuild -p ios` after pulling
  config changes.
- The API base URL comes from `EXPO_PUBLIC_API_URL` (falls back to the Hostinger
  URL in `src/api/config.ts`). Env vars are inlined at build time — rebuild after
  changing them.
- `ios/` is generated: never hand-edit it; put changes in `app.json` /
  config plugins so they survive the next prebuild.
