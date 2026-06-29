import React from 'react';
import { StyleSheet, Pressable, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme } from '@/theme';

interface IconButtonProps {
  onPress: () => void;
  type: 'back' | 'menu' | 'close' | 'custom';
  icon?: React.ReactNode;
  bg?: string;
  size?: number;
  accessibilityLabel: string;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  type,
  icon,
  bg = theme.colors.primary,
  size = 40,
  accessibilityLabel,
  style,
}) => {
  const renderIconContent = () => {
    switch (type) {
      case 'back':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 19L8 12L15 5"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case 'menu':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M4 6H20M4 12H20M4 18H20"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </Svg>
        );
      case 'close':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M18 6L6 18M6 6L18 18"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case 'custom':
      default:
        return icon;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          opacity: pressed ? 0.8 : 1.0,
        },
        style,
      ]}
    >
      {renderIconContent()}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
});
