import React from 'react';
import { View, ViewStyle } from 'react-native';
import { theme } from '@/theme';

interface DividerProps {
  color?: string;
  thickness?: number;
  marginVertical?: keyof typeof theme.spacing;
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({
  color = theme.colors.border.default,
  thickness = 1,
  marginVertical,
  style,
}) => {
  const dividerStyle: ViewStyle = {
    height: thickness,
    backgroundColor: color,
    width: '100%',
  };
  if (marginVertical) {
    dividerStyle.marginVertical = theme.spacing[marginVertical];
  }

  return <View style={[dividerStyle, style]} />;
};
