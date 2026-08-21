@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ----------------------------------------------------------------
echo   ServeSaathi - Automated Setup ^& Launch (Windows)
echo ----------------------------------------------------------------
echo.
echo This will check for everything the app needs on this PC and
echo install whatever is missing, then start the app.
echo.
echo IMPORTANT: If this is the FIRST time running this on this PC,
echo the full setup (Android Studio + all developer tools) can take
echo 1-2 HOURS depending on your internet speed. This is completely
echo normal - Android Studio alone is a multi-gigabyte download.
echo.
echo You're welcome to leave this window open and go do something
echo else in the meantime. Just check back every 10-15 minutes in
echo case it needs you to click "Yes" on a Windows security prompt.
echo.
pause

:: ---------------------------------------------------------------------
:: 0) winget (Windows Package Manager) - used to install everything else
:: ---------------------------------------------------------------------
echo.
echo ----------------------------------------------------------------
echo   Checking winget (Windows Package Manager)
echo ----------------------------------------------------------------
where winget >nul 2>nul
if errorlevel 1 (
  echo.
  echo winget was not found on this PC. It comes built in on Windows 10
  echo (2020 or newer^) and Windows 11.
  echo.
  echo Please install "App Installer" from the Microsoft Store, or update
  echo Windows, then run this script again. Alternatively, install these
  echo manually and re-run this script:
  echo   Git      - https://git-scm.com/downloads
  echo   Node.js  - https://nodejs.org/en/download
  echo.
  pause
  exit /b 1
) else (
  echo winget found.
)

:: ---------------------------------------------------------------------
:: 1) Git
:: ---------------------------------------------------------------------
echo.
echo ----------------------------------------------------------------
echo   Checking Git
echo ----------------------------------------------------------------
where git >nul 2>nul
if errorlevel 1 (
  echo Installing Git...
  winget install --id Git.Git -e --source winget --accept-source-agreements --accept-package-agreements
  set NEED_RESTART=1
) else (
  echo Git already installed.
)

:: ---------------------------------------------------------------------
:: 2) Node.js LTS
:: ---------------------------------------------------------------------
echo.
echo ----------------------------------------------------------------
echo   Checking Node.js
echo ----------------------------------------------------------------
where node >nul 2>nul
if errorlevel 1 (
  echo Installing Node.js LTS...
  winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-source-agreements --accept-package-agreements
  set NEED_RESTART=1
) else (
  echo Node.js already installed.
)

if defined NEED_RESTART (
  echo.
  echo ----------------------------------------------------------------
  echo   Git and/or Node.js were just installed for the first time.
  echo   Close this window now and double-click this script again so
  echo   Windows picks up the new PATH settings.
  echo ----------------------------------------------------------------
  pause
  exit /b 0
)

:: ---------------------------------------------------------------------
:: 3) Android Studio (optional, only needed for the Android Emulator)
:: ---------------------------------------------------------------------
echo.
echo ----------------------------------------------------------------
echo   Android Studio (only needed for the Android Emulator)
echo ----------------------------------------------------------------
if exist "%LOCALAPPDATA%\Android\Sdk" (
  echo Android SDK already found.
) else (
  set /p WANT_ANDROID="Install Android Studio now for the Android Emulator? (y/n): "
  if /i "!WANT_ANDROID!"=="y" (
    echo Installing Android Studio via winget (large download, please be patient^)...
    winget install --id Google.AndroidStudio -e --source winget --accept-source-agreements --accept-package-agreements
    echo.
    echo IMPORTANT: Open Android Studio from the Start Menu once, complete
    echo the first-time setup wizard (default options are fine^), then open
    echo "More Actions -^> Virtual Device Manager" and create + start a
    echo virtual phone before choosing the Android Emulator option below.
    pause
  ) else (
    echo Skipping Android Studio. You can still use Expo Go or the web option.
  )
)

:: ---------------------------------------------------------------------
:: 4) Project dependencies
:: ---------------------------------------------------------------------
echo.
echo ----------------------------------------------------------------
echo   Installing project dependencies (npm install)
echo ----------------------------------------------------------------
call npm install
if errorlevel 1 (
  echo.
  echo npm install failed. See the error above and try again.
  pause
  exit /b 1
)

:: ---------------------------------------------------------------------
:: 5) Environment file
:: ---------------------------------------------------------------------
if not exist ".env.development" (
  if exist ".env.example" (
    echo.
    echo ----------------------------------------------------------------
    echo   Setting up .env.development
    echo ----------------------------------------------------------------
    copy /Y ".env.example" ".env.development" >nul
    echo Created .env.development from .env.example (defaults work out of the box^).
  )
)

:: ---------------------------------------------------------------------
:: 6) Run it
:: ---------------------------------------------------------------------
echo.
echo ----------------------------------------------------------------
echo   Setup complete!
echo ----------------------------------------------------------------
echo How would you like to run ServeSaathi?
echo.
echo   1^) Expo Go on my phone   (easiest - scan a QR code, no emulator needed^)
echo   2^) Android Emulator       (needs Android Studio + a running virtual device^)
echo   3^) Web browser
echo   4^) Exit - I'll run it myself later with "npm start"
echo.
echo Note: iOS Simulator is not available on Windows (Apple restriction^).
echo Use an iPhone with the Expo Go app instead.
echo.
set /p CHOICE="Enter 1, 2, 3, or 4: "

if "%CHOICE%"=="1" (
  call npm start
) else if "%CHOICE%"=="2" (
  call npm run android
) else if "%CHOICE%"=="3" (
  call npm run web
) else (
  echo Okay! Run "npm start" in this folder anytime to launch the app.
)

pause
