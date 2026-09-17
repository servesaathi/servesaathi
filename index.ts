import { enableScreens } from 'react-native-screens';

// Must run before any navigator mounts: without it, @react-navigation/stack
// falls back to plain Views, so every screen you've ever pushed stays fully
// mounted underneath the current one — on Android, an elevated absolutely-
// positioned view from a stale screen (e.g. GuestBottomNav) then bleeds
// through on top of whatever screen is actually focused.
enableScreens();

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
