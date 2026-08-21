import React from 'react';
import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import { useAccessibilityStore, FONT_SIZE_DEFAULT } from '../store/accessibility.store';

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
// Fast Refresh re-executes this module whenever a dependency (e.g. the
// accessibility store) changes, but the Object.defineProperty patch below
// persists on RN's shared module object across those re-runs. Capturing
// `RN.Text` unconditionally would then grab the *already-wrapped* component
// from the previous run instead of the native one, nesting a fresh wrapper
// around it on every reload — AccessibleText -> AccessibleText -> ... —
// until the tree recurses deep enough to blow the JS call stack. Unwrapping
// via the tag below keeps every (re-)install pointing at the true native
// component no matter how many times this module gets re-evaluated.
const OriginalText = (RN.Text as any).__accessibleOriginal ?? RN.Text;
const OriginalTextInput = (RN.TextInput as any).__accessibleOriginal ?? RN.TextInput;

// High contrast used to snap every hex text color to pure black/white by
// luminance here — a blunt global stopgap for screens that hardcode static
// colors and can't react to anything. Now that src/theme/palette.ts carries
// the real Figma high-contrast palette (near-white/near-black body text, but
// a distinct gray for secondary text and real green/orange accent colors for
// interactive text), that blanket snap would actively fight the design: e.g.
// the brand green used for "Edit your photo" (#58A35B) has luminance <0.55
// and would get flattened to black-on-black. Color now comes solely from
// each screen reading useThemeColors() (src/hooks/useThemeColors.ts) — this
// module only handles font-size scaling, which every screen gets for free
// without being theme-converted.
const useAccessibleTextStyle = (style: StyleProp<TextStyle>): StyleProp<TextStyle> => {
  const fontSize = useAccessibilityStore((s) => s.fontSize);
  const multiplier = fontSize / FONT_SIZE_DEFAULT;

  if (multiplier === 1) return style;

  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  const overrides: TextStyle = {};

  // Only scale explicit sizes — nested <Text> without fontSize inherits its
  // (already scaled) parent size natively, so touching it would double-scale.
  if (typeof flat?.fontSize === 'number') {
    overrides.fontSize = Math.round(flat.fontSize * multiplier);
    if (typeof flat.lineHeight === 'number') {
      overrides.lineHeight = Math.round(flat.lineHeight * multiplier);
    }
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
// Tag with the native component it wraps so a future re-evaluation of this
// module (see OriginalText above) can unwrap back to it instead of nesting.
(AccessibleText as any).__accessibleOriginal = OriginalText;

const AccessibleTextInput = React.forwardRef<unknown, AnyTextProps>(({ style, ...rest }, ref) => {
  return <OriginalTextInput ref={ref} {...rest} style={useAccessibleTextStyle(style as StyleProp<TextStyle>)} />;
});
(AccessibleTextInput as any).__accessibleOriginal = OriginalTextInput;

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
