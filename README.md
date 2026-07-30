# ServeSaathi

This guide will help you get the ServeSaathi app running on your own computer, step by step —
even if you've never set up a coding project before.

There are two ways to run the app:

- **🟢 Easy path — Expo Go:** See the app on your own phone in a few minutes. No Xcode or
  Android Studio needed.
- **🔵 Full path — Simulator / Emulator:** Run the app in an iPhone or Android simulator on your
  computer, just like a real developer setup. Takes longer to install but doesn't need a phone.

You can do either one, or both. Follow the steps in order — don't skip ahead.

---

## What you'll need

| Tool | Needed for | Mac | Windows |
|---|---|---|---|
| [Git](https://git-scm.com/downloads) | Downloading the code | ✅ | ✅ |
| [Node.js](https://nodejs.org/en/download) (LTS version) | Running the project | ✅ | ✅ |
| [Expo Go app](https://expo.dev/go) (on your phone) | Easy path only | ✅ | ✅ |
| [Xcode](https://apps.apple.com/us/app/xcode/id497799835) | iOS Simulator (Full path) | ✅ | ❌ not available |
| [Android Studio](https://developer.android.com/studio) | Android Emulator (Full path) | ✅ | ✅ |

> **Note:** Apple only allows iOS Simulators to run on a Mac. If you're on Windows, you can still
> run the app on Android (emulator or your own phone) or view it on an iPhone using the Expo Go
> app on a real iPhone.

---

## Step 1 — Install Git

Git is the tool used to download ("clone") the project's code.

- **Mac:** Open the **Terminal** app and type `git --version`. If it's not installed, macOS will
  prompt you to install it automatically.
- **Windows:** Download and install it from [git-scm.com/downloads](https://git-scm.com/downloads)
  (keep all default options during install).

Check it worked by opening a terminal (Mac: **Terminal**, Windows: **Command Prompt** or
**PowerShell**) and running:

```bash
git --version
```

You should see something like `git version 2.43.0`.

---

## Step 2 — Install Node.js

Node.js is what runs the project's tools and dependencies.

1. Go to [nodejs.org/en/download](https://nodejs.org/en/download).
2. Download the **LTS** version (the one marked "Recommended for Most Users") for your operating
   system.
3. Run the installer and keep clicking "Next" with the default options.

Check it worked:

```bash
node -v
npm -v
```

Both commands should print a version number (e.g. `v20.11.0` and `10.2.4`).

---

## Step 3 — Download the project code

Open a terminal, go to a folder where you'd like to keep the project (e.g. your Desktop), and
run:

```bash
git clone https://github.com/servesaathi/servesaathi.git
cd servesaathi
```

This creates a `servesaathi` folder with all the project files inside it.

---

## Step 4 — Install the project's dependencies

Still inside the `servesaathi` folder in your terminal, run:

```bash
npm install
```

This downloads all the packages the app needs. It can take a few minutes — that's normal.

---

## Step 5 — Set up environment variables

The app needs a small config file that tells it which server to talk to.

1. In the project folder, find the file named **`.env.example`**.
2. Make a copy of it and rename the copy to **`.env.development`**.
   - Mac/Linux terminal: `cp .env.example .env.development`
   - Windows terminal: `copy .env.example .env.development`
3. You can leave the default values as they are — they're already set up to work out of the box.

---

## Step 6 — Run the app

### 🟢 Easy path: Expo Go (recommended for non-developers)

1. On your phone, install the **Expo Go** app:
   - iPhone: [App Store link](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store link](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. In your terminal (inside the `servesaathi` folder), run:
   ```bash
   npm start
   ```
3. A QR code will appear in the terminal.
4. Scan it:
   - **iPhone:** open the Camera app and point it at the QR code, then tap the notification.
   - **Android:** open the Expo Go app and use its built-in "Scan QR code" option.
5. The app will load on your phone. Any time the code changes, it refreshes automatically.

Your phone and computer must be connected to the **same Wi-Fi network** for this to work.

### 🔵 Full path: iOS Simulator (Mac only)

1. Install **Xcode** from the Mac App Store (it's a large download, a few GB — this can take a
   while).
2. Open Xcode once after installing, so it can finish setting itself up.
3. Install CocoaPods (a tool Xcode projects use for dependencies). In your terminal:
   ```bash
   sudo gem install cocoapods
   ```
4. Back in the `servesaathi` project folder, run:
   ```bash
   npm run ios
   ```
5. This will build the app and automatically open it in an iPhone Simulator window on your
   screen. The first build can take several minutes.

For more detail and troubleshooting on iOS builds, see
[docs/BUILD-IOS.md](docs/BUILD-IOS.md).

### 🔵 Full path: Android Emulator (Mac or Windows)

1. Install **Android Studio** from
   [developer.android.com/studio](https://developer.android.com/studio).
2. Open Android Studio, go through the first-time setup wizard (accept the default options), then
   open **More Actions → Virtual Device Manager** and create a new virtual device (any recent
   phone, e.g. "Pixel 8", with the latest Android version is fine). Start it once so it boots up.
3. Make sure the Android SDK tools are on your system PATH:
   - **Mac** — add these lines to `~/.zshrc` (open Terminal, run `nano ~/.zshrc`, paste, save
     with `Ctrl+O` then `Ctrl+X`), then restart your terminal:
     ```bash
     export ANDROID_HOME=$HOME/Library/Android/sdk
     export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator
     ```
   - **Windows** — Android Studio usually sets this up automatically. If `adb devices` (see
     below) doesn't work, search "Environment Variables" in the Start Menu and add an
     `ANDROID_HOME` variable pointing to your Android SDK folder (shown in Android Studio →
     **Settings → Languages & Frameworks → Android SDK**).
4. Confirm the emulator is visible:
   ```bash
   adb devices
   ```
5. Back in the `servesaathi` project folder, run:
   ```bash
   npm run android
   ```
6. The app will build and launch inside the running emulator. The first build can take several
   minutes.

For more detail and troubleshooting on Android builds, see
[docs/BUILD-APK.md](docs/BUILD-APK.md).

---

## Troubleshooting

- **"command not found: git/node/npm"** — close and reopen your terminal after installing (this
  refreshes the list of available commands), then try again.
- **`npm install` fails** — make sure you're inside the `servesaathi` folder
  (run `cd servesaathi` first), and that Node.js was installed correctly (`node -v` works).
- **QR code won't scan / app won't load on phone** — double check your phone and computer are on
  the same Wi-Fi network, and no VPN is active on either device.
- **iOS Simulator build fails** — make sure you opened Xcode at least once after installing, and
  that CocoaPods installed successfully (`pod --version` should print a version number).
- **Android build fails / `adb devices` shows nothing** — make sure a virtual device is actually
  running (open it from Android Studio's Virtual Device Manager) before running `npm run android`.
- Still stuck? Open an issue on the
  [GitHub repository](https://github.com/servesaathi/servesaathi) describing what step you were
  on and the exact error message.

---

## Quick reference

| Command | What it does |
|---|---|
| `npm start` | Starts the app for Expo Go (scan QR code with your phone) |
| `npm run ios` | Builds and runs the app in the iOS Simulator (Mac only) |
| `npm run android` | Builds and runs the app in the Android Emulator |
| `npm run web` | Runs the app in a web browser |
| `npm test` | Runs the automated test suite |
