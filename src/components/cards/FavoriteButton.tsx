import React from 'react';
import { StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme } from '@/theme';

interface FavoriteButtonProps {
  active?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

// "Favorite" from Figma Card Views (node 103:288) — heart toggle button used on
// event/organization cards. Figma's heart glyph wasn't in the extracted icon set,
// so this draws an equivalent heart path directly.
export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ active = false, onPress, style }) => {
  return (
    <Pressable onPress={onPress} style={[styles.button, style]}>
      <Svg width="18" height="16" viewBox="0 0 18 16" fill="none">
        <Path
          d="M9 15C9 15 1 10.5 1 5.5C1 3 3 1 5.5 1C7 1 8.3 1.8 9 3C9.7 1.8 11 1 12.5 1C15 1 17 3 17 5.5C17 10.5 9 15 9 15Z"
          fill={active ? '#FFFFFF' : 'none'}
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: theme.colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
