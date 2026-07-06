import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Pressable, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';

interface ToggleSwitchProps {
  value: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const TRACK_WIDTH = 36;
const TRACK_HEIGHT = 20;
const THUMB_SIZE = 16;

// "Checkbox Item Base" Toggle type from Figma Inputs & Forms (node 103:289). Figma's asset
// is a flattened raster image, so this rebuilds it as a real animated switch instead.
export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  style,
}) => {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [value, anim]);

  const trackColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.forestGreen[100], theme.colors.primary],
  });

  const thumbTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, TRACK_WIDTH - THUMB_SIZE - 2],
  });

  return (
    <Pressable
      onPress={disabled ? undefined : () => onValueChange?.(!value)}
      disabled={disabled}
      style={[{ opacity: disabled ? 0.5 : 1 }, style]}
    >
      <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View style={[styles.thumb, { transform: [{ translateX: thumbTranslate }] }]} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#FFFFFF',
  },
});
