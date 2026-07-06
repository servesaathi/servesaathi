import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { LOGO_DATA } from './logo/logoData.generated';

export type LogoLanguage = 'english' | 'hindi';
export type LogoColorVariant = 'brand' | 'white' | 'grey';

const COLOR_VARIANT_KEY: Record<LogoColorVariant, string> = {
  brand: 'colors',
  white: 'white',
  grey: 'grey',
};

interface BrandLogoProps {
  language?: LogoLanguage;
  colorVariant?: LogoColorVariant;
  width?: number | string;
  height?: number | string;
  style?: StyleProp<ViewStyle>;
}

export const BrandLogoSVG: React.FC<BrandLogoProps> = ({
  language = 'english',
  colorVariant = 'brand',
  width,
  height,
  style,
}) => {
  const key = `${language}-${COLOR_VARIANT_KEY[colorVariant]}`;
  const variant = LOGO_DATA[key];

  const aspectRatio = variant.width / variant.height;
  let resolvedWidth = width;
  let resolvedHeight = height;

  if (resolvedWidth == null && resolvedHeight == null) {
    resolvedHeight = 64;
    resolvedWidth = 64 * aspectRatio;
  } else if (resolvedWidth == null && typeof resolvedHeight === 'number') {
    resolvedWidth = resolvedHeight * aspectRatio;
  } else if (resolvedHeight == null && typeof resolvedWidth === 'number') {
    resolvedHeight = resolvedWidth / aspectRatio;
  }

  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${variant.viewBox}">${variant.xml}</svg>`;

  return <SvgXml xml={xml} width={resolvedWidth} height={resolvedHeight} style={style} />;
};

export default BrandLogoSVG;
