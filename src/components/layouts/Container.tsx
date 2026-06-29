import React from 'react';
import { View, ViewStyle } from 'react-native';
import { theme } from '@/theme';

interface ContainerProps {
  children: React.ReactNode;
  padding?: keyof typeof theme.spacing;
  margin?: keyof typeof theme.spacing;
  bg?: string;
  style?: ViewStyle;
  row?: boolean;
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justify?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
}

export const Container: React.FC<ContainerProps> = ({
  children,
  padding,
  margin,
  bg,
  style,
  row = false,
  align,
  justify,
}) => {
  const containerStyles: ViewStyle[] = [{ flexDirection: row ? 'row' : 'column' }];
  if (padding) containerStyles.push({ padding: theme.spacing[padding] });
  if (margin) containerStyles.push({ margin: theme.spacing[margin] });
  if (bg) containerStyles.push({ backgroundColor: bg });
  if (align) containerStyles.push({ alignItems: align });
  if (justify) containerStyles.push({ justifyContent: justify });
  if (style) containerStyles.push(style);

  return <View style={containerStyles}>{children}</View>;
};
