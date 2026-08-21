#!/bin/bash
# ServeSaathi - one-click setup & launch for macOS
# Double-click this file in Finder (or run "./start-servesaathi-mac.command" in Terminal).
#
# What it does:
#   1) Installs any missing prerequisites (Homebrew, Git, Node.js, CocoaPods, Watchman,
#      and optionally Android Studio / Xcode command line tools).
#   2) Runs "npm install" for this project.
#   3) Sets up the .env.development file if it doesn't exist yet.
#   4) Lets you pick how to run the app (Expo Go / iOS Simulator / Android Emulator / Web).

set -e
cd "$(dirname "$0")"

divider() { echo "----------------------------------------------------------------"; }

clear
divider
echo "  ServeSaathi - Automated Setup & Launch (macOS)"
divider
echo
echo "This will check for everything the app needs on this Mac and"
echo "install whatever is missing, then start the app."
echo
echo "IMPORTANT: If this is the FIRST time running this on this Mac,"
echo "the full setup (Xcode + Android Studio + all developer tools)"
echo "can take 1-2 HOURS depending on your internet speed. This is"
echo "completely normal - Xcode alone is a ~10-12 GB download."
echo
echo "You're welcome to leave this Terminal window open and go do"
echo "something else in the meantime. Just check back every 10-15"
echo "minutes in case it needs your Mac password or a click on a"
echo "popup window."
echo
read -p "Press ENTER to begin... " _

step() { echo; divider; echo "==> $1"; divider; }

# ---------------------------------------------------------------------------
# 1) Homebrew (package manager used to install everything else)
# ---------------------------------------------------------------------------
step "Checking Homebrew"
if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew not found. Installing it now (this can take several minutes"
  echo "and may ask for your Mac password)..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

  if [ -x /opt/homebrew/bin/brew ]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [ -x /usr/local/bin/brew ]; then
    eval "$(/usr/local/bin/brew shellenv)"
  fi
else
  echo "Homebrew already installed."
fi

# ---------------------------------------------------------------------------
# 2) Xcode Command Line Tools (provides git, and is needed for iOS builds)
# ---------------------------------------------------------------------------
step "Checking Xcode Command Line Tools (needed for git and iOS builds)"
if ! xcode-select -p >/dev/null 2>&1; then
  echo "Requesting install of Xcode Command Line Tools..."
  echo "A popup window will appear - click 'Install' and accept the license."
  xcode-select --install >/dev/null 2>&1 || true

  echo "Waiting for the install to finish (this can take 10-30 minutes)..."
  until xcode-select -p >/dev/null 2>&1; do
    sleep 20
    echo "  ...still waiting on Xcode Command Line Tools. Please click 'Install'"
    echo "  in the popup if you haven't already."
  done
  echo "Xcode Command Line Tools installed."
else
  echo "Xcode Command Line Tools already installed."
fi

# ---------------------------------------------------------------------------
# 3) Git
# ---------------------------------------------------------------------------
step "Checking Git"
if ! command -v git >/dev/null 2>&1; then
  brew install git
else
  echo "Git already installed ($(git --version))."
fi

# ---------------------------------------------------------------------------
# 4) Node.js (LTS)
# ---------------------------------------------------------------------------
step "Checking Node.js"
if ! command -v node >/dev/null 2>&1; then
  echo "Installing Node.js LTS via Homebrew..."
  brew install node
else
  echo "Node.js already installed ($(node -v))."
fi

# ---------------------------------------------------------------------------
# 5) Watchman (recommended by React Native for fast file watching)
# ---------------------------------------------------------------------------
step "Checking Watchman"
if ! command -v watchman >/dev/null 2>&1; then
  brew install watchman
else
  echo "Watchman already installed."
fi

# ---------------------------------------------------------------------------
# 6) CocoaPods (needed for the iOS Simulator path)
# ---------------------------------------------------------------------------
step "Checking CocoaPods (needed only for the iOS Simulator)"
if ! command -v pod >/dev/null 2>&1; then
  brew install cocoapods
else
  echo "CocoaPods already installed ($(pod --version))."
fi

# ---------------------------------------------------------------------------
# 7) Full Xcode.app (required for the iOS Simulator - CLT alone isn't enough)
# ---------------------------------------------------------------------------
step "Checking for the full Xcode app (only needed for iOS Simulator)"
if [ -d "/Applications/Xcode.app" ]; then
  echo "Xcode.app found."
else
  echo "Xcode.app was NOT found. The iOS Simulator option will not work until"
  echo "you install Xcode from the Mac App Store (a large, ~10-12 GB download)."
  read -p "Open the App Store page for Xcode now? (y/n): " OPEN_XCODE
  if [ "$OPEN_XCODE" = "y" ] || [ "$OPEN_XCODE" = "Y" ]; then
    open "macappstore://apps.apple.com/us/app/xcode/id497799835"
    echo "Install Xcode from the App Store, open it once to finish setup,"
    echo "then re-run this script if you want the iOS Simulator option."
  fi
fi

# ---------------------------------------------------------------------------
# 8) Android Studio (optional, only needed for the Android Emulator)
# ---------------------------------------------------------------------------
step "Android Studio (only needed for the Android Emulator)"
if [ -d "/Applications/Android Studio.app" ]; then
  echo "Android Studio already installed."
else
  read -p "Install Android Studio now for the Android Emulator? (y/n): " WANT_ANDROID
  if [ "$WANT_ANDROID" = "y" ] || [ "$WANT_ANDROID" = "Y" ]; then
    echo "Installing Android Studio via Homebrew (large download, please be patient)..."
    brew install --cask android-studio
    echo
    echo "IMPORTANT: Open Android Studio from Launchpad once, complete the"
    echo "first-time setup wizard (default options are fine), then open"
    echo "'More Actions -> Virtual Device Manager' and create + start a"
    echo "virtual phone before choosing the Android Emulator option below."
    read -p "Press ENTER once you've done that (or to skip for now)... " _
  else
    echo "Skipping Android Studio. You can still use Expo Go or the web option."
  fi
fi

# ---------------------------------------------------------------------------
# 9) Project dependencies
# ---------------------------------------------------------------------------
step "Installing project dependencies (npm install)"
npm install

# ---------------------------------------------------------------------------
# 10) Environment file
# ---------------------------------------------------------------------------
if [ ! -f ".env.development" ] && [ -f ".env.example" ]; then
  step "Setting up .env.development"
  cp .env.example .env.development
  echo "Created .env.development from .env.example (defaults work out of the box)."
fi

# ---------------------------------------------------------------------------
# 11) Run it
# ---------------------------------------------------------------------------
step "Setup complete!"
echo "How would you like to run ServeSaathi?"
echo
echo "  1) Expo Go on my phone   (easiest - scan a QR code, no simulator needed)"
echo "  2) iOS Simulator          (Mac only, needs Xcode)"
echo "  3) Android Emulator       (needs Android Studio + a running virtual device)"
echo "  4) Web browser"
echo "  5) Exit - I'll run it myself later with 'npm start'"
echo
read -p "Enter 1, 2, 3, 4, or 5: " CHOICE

case "$CHOICE" in
  1) npm start ;;
  2) npm run ios ;;
  3) npm run android ;;
  4) npm run web ;;
  *) echo "Okay! Run 'npm start' in this folder anytime to launch the app." ;;
esac
