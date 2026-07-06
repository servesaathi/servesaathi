import React from 'react';
import { View, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { theme } from '@/theme';
import { LOGO_DATA } from './logo/logoData.generated';

interface LogoSvgProps {
  language?: 'english' | 'hindi';
  color?: string;
  width?: number;
  height?: number;
  style?: ViewStyle;
}

export const LogoSvg: React.FC<LogoSvgProps> = ({
  language = 'english',
  color = theme.colors.primary, // Defaults to Forest Green 500 (#2E7D32)
  width,
  height,
  style,
}) => {
  const variant = LOGO_DATA[`${language}-colors`];
  const aspectRatio = variant.width / variant.height;

  let resolvedWidth = width;
  let resolvedHeight = height;
  if (resolvedWidth == null && resolvedHeight == null) {
    resolvedWidth = 264;
    resolvedHeight = 264 / aspectRatio;
  } else if (resolvedWidth == null && resolvedHeight != null) {
    resolvedWidth = resolvedHeight * aspectRatio;
  } else if (resolvedHeight == null && resolvedWidth != null) {
    resolvedHeight = resolvedWidth / aspectRatio;
  }

  // Flatten the two-tone artwork (brand orange + near-black) into a single tint color.
  const tinted = variant.xml.replace(/fill="(?!none")[^"]*"/g, `fill="${color}"`);
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${variant.viewBox}">${tinted}</svg>`;

  return (
    <View style={style}>
      <SvgXml xml={xml} width={resolvedWidth} height={resolvedHeight} />
    </View>
  );
};

export default LogoSvg;
