import React from 'react';
import { View } from 'react-native';
import { theme } from '@/theme';
import { scale, verticalScale } from '@/utils/responsive';

interface SpacerProps {
  size?: keyof typeof theme.spacing | number;
  horizontal?: boolean;
}

export const Spacer: React.FC<SpacerProps> = ({ size = 'md', horizontal = false }) => {
  const spacingValue = typeof size === 'number' ? size : theme.spacing[size];
  const sizeValue = horizontal ? scale(spacingValue) : verticalScale(spacingValue);

  return (
    <View
      style={{
        width: horizontal ? sizeValue : undefined,
        height: horizontal ? undefined : sizeValue,
      }}
    />
  );
};
