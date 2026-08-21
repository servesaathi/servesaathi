import React from 'react';
import { StyleSheet, View, Pressable, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

interface RadioButtonProps {
  selected: boolean;
  onPress?: () => void;
  disabled?: boolean;
  color?: 'green' | 'orange';
  style?: StyleProp<ViewStyle>;
}

// "Checkbox Item Base" Radio type from Figma Inputs & Forms (node 103:289).
export const RadioButton: React.FC<RadioButtonProps> = ({
  selected,
  onPress,
  disabled = false,
  color = 'green',
  style,
}) => {
  const colors = useThemeColors();
  const accent = color === 'orange' ? colors.accentOrange : colors.accentPrimary;
  const borderColor = disabled ? colors.border.hairline : accent;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[styles.circle, { backgroundColor: colors.background.base, borderColor }, style]}
    >
      {selected && (
        <View
          style={[
            styles.dot,
            { backgroundColor: disabled ? colors.border.hairline : accent },
          ]}
        />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  circle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
