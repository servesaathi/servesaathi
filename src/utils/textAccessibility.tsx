import React from 'react';
import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import { useAccessibilityStore, FONT_SCALE_MULTIPLIERS } from '../store/accessibility.store';

// App-wide accessibility rendering: every screen builds its styles with
// StyleSheet.create at module load, so the user's font-size / contrast choices
// can't flow through the theme after the fact. Instead we swap the `Text` and
// `TextInput` exports of react-native for thin wrappers that read the
// accessibility store and adjust the flattened style at render time. Because
// Metro resolves `import { Text } from 'react-native'` to a live property
// access on the module object, redefining the getter (react-native/index.js
// exposes configurable getters) retargets the whole app — and every mounted
// Text re-renders on store changes via the zustand subscription.

const RN = require('react-native');
const OriginalText = RN.Text;
const OriginalTextInput = RN.TextInput;

// Snap a hex color to pure black/white for high-contrast mode. Non-hex values
// (rgba(), named colors) are left untouched.
const highContrastColor = (color: unknown): string | undefined => {
  if (typeof color !== 'string') return undefined;
  const hex = color.trim();
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);
  if (!match) return undefined;
  let value = match[1];
  if (value.length === 3) {
    value = value
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#FFFFFF' : '#000000';
};

const useAccessibleTextStyle = (style: StyleProp<TextStyle>): StyleProp<TextStyle> => {
  const fontSizeLevel = useAccessibilityStore((s) => s.fontSizeLevel);
  const highContrast = useAccessibilityStore((s) => s.highContrast);
  const multiplier = FONT_SCALE_MULTIPLIERS[fontSizeLevel];

  if (multiplier === 1 && !highContrast) return style;

  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  const overrides: TextStyle = {};

  // Only scale explicit sizes — nested <Text> without fontSize inherits its
  // (already scaled) parent size natively, so touching it would double-scale.
  if (multiplier !== 1 && typeof flat?.fontSize === 'number') {
    overrides.fontSize = Math.round(flat.fontSize * multiplier);
    if (typeof flat.lineHeight === 'number') {
      overrides.lineHeight = Math.round(flat.lineHeight * multiplier);
    }
  }

  if (highContrast) {
    const snapped = highContrastColor(flat?.color);
    if (snapped) overrides.color = snapped;
  }

  return Object.keys(overrides).length ? [style, overrides] : style;
};

type AnyTextProps = { style?: StyleProp<TextStyle> } & Record<string, unknown>;

// forwardRef is required: React Native's own focus/keyboard management (and
// our TextInput component) grab a ref to the native input/text instance. A
// plain function component silently drops that ref, leaving RN's internal
// TextInputState registry pointing at nothing — the app then crashes with
// "Cannot read property 'currentlyFocusedInput' of undefined" the moment any
// screen with a TextInput mounts.
const AccessibleText = React.forwardRef<unknown, AnyTextProps>(({ style, ...rest }, ref) => {
  return <OriginalText ref={ref} {...rest} style={useAccessibleTextStyle(style as StyleProp<TextStyle>)} />;
});

const AccessibleTextInput = React.forwardRef<unknown, AnyTextProps>(({ style, ...rest }, ref) => {
  return <OriginalTextInput ref={ref} {...rest} style={useAccessibleTextStyle(style as StyleProp<TextStyle>)} />;
});

let installed = false;

export const installTextAccessibility = (): void => {
  if (installed) return;
  installed = true;
  // react-native's index.js exposes configurable getters, but react-native-web's
  // transpiled exports are non-configurable — there defineProperty throws, so the
  // patch (and with it in-app font scaling) is skipped rather than crashing web.
  try {
    Object.defineProperty(RN, 'Text', { configurable: true, get: () => AccessibleText });
    Object.defineProperty(RN, 'TextInput', { configurable: true, get: () => AccessibleTextInput });
  } catch {
    if (__DEV__) {
      console.warn('textAccessibility: could not patch Text/TextInput on this platform');
    }
  }
};
