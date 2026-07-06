import React from 'react';
import { SvgXml } from 'react-native-svg';
import { ICON_PATHS } from './iconData.generated';
import { IconName, IconVariant } from './iconNames.generated';

const SOURCE_COLOR = '#FF751F';

interface IconProps {
  name: IconName;
  variant?: IconVariant;
  size?: number;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ name, variant = 'outline', size = 16, color }) => {
  const key = `${name}__${variant}`;
  const fallbackVariant: IconVariant = variant === 'outline' ? 'filled' : 'outline';
  const inner = ICON_PATHS[key] ?? ICON_PATHS[`${name}__${fallbackVariant}`];

  if (!inner) {
    if (__DEV__) {
      console.warn(`Icon: no artwork found for "${name}" (${variant})`);
    }
    return null;
  }

  const content = color ? inner.split(SOURCE_COLOR).join(color) : inner;
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${content}</svg>`;

  return <SvgXml xml={xml} width={size} height={size} />;
};
