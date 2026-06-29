export const fonts = {
  regular: 'AtkinsonHyperlegible-Regular',
  semiBold: 'AtkinsonHyperlegible-Bold',
  bold: 'AtkinsonHyperlegible-Bold',
};

export const typography = {
  h1: {
    fontFamily: fonts.semiBold,
    fontSize: 26,
    lineHeight: 34,
  },
  h2: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    lineHeight: 30,
  },
  h3: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  h4: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  h5: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  h6: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  bodyLarge: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
  },
  bodyMedium: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 17,
  },
  smallCaption: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 20,
  },
  screenTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600' as const,
  },
  screenParagraph: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
};

export type Typography = typeof typography;
export type Fonts = typeof fonts;
