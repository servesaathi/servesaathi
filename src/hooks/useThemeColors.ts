import { useThemeStore } from '@/store/theme.store';
import { useAccessibilityStore } from '@/store/accessibility.store';
import {
  lightPalette,
  darkPalette,
  highContrastLight,
  highContrastDark,
  type ThemePalette,
} from '@/theme/palette';

// Single source of truth for the reactive subset of theme colors: OS dark
// mode (src/store/theme.store.ts) crossed with the high-contrast toggle
// (src/store/accessibility.store.ts, set from the Accessibility screen).
// High contrast wins over dark mode — and unlike light/dark, Figma only
// defines ONE high-contrast theme (see src/theme/palette.ts), so
// highContrastLight/highContrastDark are the same object; the isDark branch
// below is kept only so this hook's shape stays uniform.
export const useThemeColors = (): ThemePalette => {
  const isDark = useThemeStore((s) => s.colorScheme === 'dark');
  const highContrast = useAccessibilityStore((s) => s.highContrast);

  if (highContrast) return isDark ? highContrastDark : highContrastLight;
  return isDark ? darkPalette : lightPalette;
};

export const useIsDarkMode = (): boolean => useThemeStore((s) => s.colorScheme === 'dark');

export default useThemeColors;
