import { create } from 'zustand';
import { Appearance, type ColorSchemeName } from 'react-native';

// Mirrors the OS color scheme so any component reading it via useThemeColors()
// (src/hooks/useThemeColors.ts) re-renders the instant the phone's dark mode
// setting flips — including a live "match system" toggle while the app is
// foregrounded. Not persisted: this always reflects the OS, by design (the
// accessibility screen only has a high-contrast override, no manual
// light/dark switch yet).
interface ThemeState {
  colorScheme: ColorSchemeName;
}

export const useThemeStore = create<ThemeState>(() => ({
  colorScheme: Appearance.getColorScheme(),
}));

Appearance.addChangeListener(({ colorScheme }) => {
  useThemeStore.setState({ colorScheme });
});

export default useThemeStore;
