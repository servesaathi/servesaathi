// Reactive theme tokens — layered on top of the static `colors` in ./colors.ts.
// `colors` stays a fixed light palette (used directly by most screens' static
// StyleSheet.create calls, which can't react to anything at runtime). This
// file is the *dynamic* subset: the handful of surface/text/border tokens
// that actually need to flip when the OS switches dark mode or the user
// turns on high contrast. Consumed via useThemeColors() (src/hooks/useThemeColors.ts),
// never imported directly — that hook is what makes it reactive.
export interface ThemePalette {
  background: {
    layout: string; // screen canvas
    base: string; // cards / raised surfaces
    orange: string; // accent-tinted surfaces
  };
  text: {
    // Mirrors the 5 neutral-scale shades (theme.colors.neutral[N]) that the
    // static, non-reactive screens were built against, so swapping a call
    // site over to one of these tokens reproduces the exact same light-mode
    // color instead of flattening everything to just two grays.
    primary: string; // neutral 900 — headings, primary emphasis
    strong: string; // neutral 800 — emphasized body text / values
    secondary: string; // neutral 700 — default secondary text / labels
    tertiary: string; // neutral 600 — captions, detail lines
    muted: string; // neutral 500 — placeholders, quiet section labels
  };
  border: {
    card: string; // border.green / forestGreen 200 — outlined cards, swatches
    hairline: string; // forestGreen 100 — thin dividers (tab bar top border)
  };
  tabBar: string;
  accentPrimary: string; // brand green, tuned per-mode for legibility
  accentOrange: string; // brand orange (theme.colors.tertiary equivalent), tuned per-mode
  // A visibly muted version of accentOrange — inactive stepper dots, etc.
  // Not a fixed-alpha blend of accentOrange: light mode wants a *lighter*
  // tint (Vivid Orange 200, #FFC8A5) while dark/high-contrast wants a
  // *darker* shade (#994F24) to stay muted against a dark background, so the
  // two directions need their own per-mode value.
  accentOrangeMuted: string;
  // Text drawn on top of a filled accentPrimary surface (e.g. a PrimaryButton
  // label). Usually white, but high contrast's medium green (#58A35B) reads
  // better with a dark label per the Figma high-contrast spec, so this isn't
  // always the same as a hardcoded white.
  textInverse: string;
}

export const lightPalette: ThemePalette = {
  background: { layout: '#EAF2EA', base: '#FFFFFF', orange: '#FFF5EF' },
  text: {
    primary: '#1E1B18',
    strong: '#34322F',
    secondary: '#4B4946',
    tertiary: '#615F5D',
    muted: '#787674',
  },
  border: { card: '#ABCBAD', hairline: '#D5E5D6' },
  tabBar: '#FFFFFF',
  accentPrimary: '#2E7D32',
  accentOrange: '#FF751F',
  accentOrangeMuted: '#FFC8A5',
  textInverse: '#FFFFFF',
};

// Dark background per spec: #0D1F0E. Surface/orange tones are lifted just
// enough off that base to stay distinguishable as raised cards; text and
// border tokens are picked for contrast against #0D1F0E specifically.
export const darkPalette: ThemePalette = {
  background: { layout: '#0D1F0E', base: '#16301A', orange: '#2B1A10' },
  text: {
    primary: '#F2F2ED',
    strong: '#DDE3DA',
    secondary: '#B8C4B9',
    tertiary: '#9FAEA0',
    muted: '#8A9A8B',
  },
  border: { card: '#2A3D2C', hairline: '#213328' },
  tabBar: '#122417',
  accentPrimary: '#58975B',
  accentOrange: '#FF9C62',
  accentOrangeMuted: '#994F24',
  textInverse: '#FFFFFF',
};

// High contrast — sourced directly from the Figma "Start an app - High
// Contrast" page (fileKey dreRLvM7kEty4p5sNhup0I, node 1513:106211) via the
// Figma MCP's resolved variable values, not an approximation. Unlike
// light/dark, Figma only defines ONE high-contrast theme (it isn't crossed
// with light/dark), so `highContrastLight` and `highContrastDark` below both
// point at this same object — high contrast always wins and always looks
// like this, regardless of the OS scheme.
//
// Deliberately NOT pure black/white: primary text is #F2F2F2 (not #FFF),
// secondary/placeholder text is a distinct gray (#AFAFAF) so labels stay
// visually subordinate to headings, and interactive text (stepper counter,
// "Edit your photo") keeps the brand green/orange accent colors rather than
// flattening to monochrome — that hierarchy is the actual point of the
// design, so src/utils/textAccessibility.tsx no longer overrides it with a
// blanket luminance-based snap (see that file for the removal rationale).
const highContrastFigma: ThemePalette = {
  background: { layout: '#0D1F0E', base: '#0F0F0F', orange: '#331A0C' },
  text: {
    primary: '#F2F2F2',
    strong: '#F2F2F2',
    secondary: '#AFAFAF',
    tertiary: '#AFAFAF',
    muted: '#787674',
  },
  border: { card: '#143017', hairline: '#143017' },
  tabBar: '#0F0F0F',
  accentPrimary: '#58A35B',
  accentOrange: '#FF9C62',
  // Vivid Orange/200 resolved in this high-contrast context — the stepper's
  // inactive dashes in the Figma mock.
  accentOrangeMuted: '#994F24',
  // Primary Color/Tertiary button label uses Neutral Color/Primary Inverse
  // (near-black) on the medium green, not white — a deliberate high-contrast
  // choice per the Figma spec (white-on-#58A35B doesn't read as "high
  // contrast" the way black-on-#58A35B does).
  textInverse: '#0F0F0F',
};

export const highContrastLight: ThemePalette = highContrastFigma;
export const highContrastDark: ThemePalette = highContrastFigma;
