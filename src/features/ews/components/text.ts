import { StyleSheet } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';

// The Figma "Mobile App" text styles the EWS frames use. Layout + type only —
// colour comes from useThemeColors() at each call site.
export const ewsText = StyleSheet.create({
  /** Mobile App/Headings/H2 — 22/30 SemiBold (screen + pop-up titles). */
  h2: { fontFamily: theme.fonts.semiBold, fontSize: responsiveFontSize(22), lineHeight: 30 },
  /** Mobile App/Headings/H3 — 20/30 SemiBold (card titles). */
  h3: { fontFamily: theme.fonts.semiBold, fontSize: responsiveFontSize(20), lineHeight: 30 },
  /** Mobile App/Headings/H4 — 18/24 SemiBold (the question). */
  h4: { fontFamily: theme.fonts.semiBold, fontSize: responsiveFontSize(18), lineHeight: 24 },
  /** Mobile App/Headings/H5 — 16/22 SemiBold (row titles). */
  h5: { fontFamily: theme.fonts.semiBold, fontSize: responsiveFontSize(16), lineHeight: 22 },
  /** Mobile App/Paragraph/Body Large — 16/22. */
  body: { fontFamily: theme.fonts.regular, fontSize: responsiveFontSize(16), lineHeight: 22 },
  /** Mobile App/Paragraph/Body Medium — 15/22. */
  bodyMd: { fontFamily: theme.fonts.regular, fontSize: responsiveFontSize(15), lineHeight: 22 },
  /** Mobile App/Supporting text/Small Caption — 14/20. */
  small: { fontFamily: theme.fonts.regular, fontSize: responsiveFontSize(14), lineHeight: 20 },
  /** Section label above a block ("WHAT WE NOTICED") — 14/20 SemiBold caps. */
  overline: {
    fontFamily: theme.fonts.semiBold,
    fontSize: responsiveFontSize(14),
    lineHeight: 20,
    textTransform: 'uppercase',
  },
  /** Supporting text/Caption — 13/17 (task chips). */
  caption: { fontFamily: theme.fonts.regular, fontSize: responsiveFontSize(13), lineHeight: 17 },
  /** "Last assessed …" — Desktop Caption 16/20, italic. */
  italic: { fontFamily: theme.fonts.regular, fontStyle: 'italic', fontSize: responsiveFontSize(16), lineHeight: 20 },
});
