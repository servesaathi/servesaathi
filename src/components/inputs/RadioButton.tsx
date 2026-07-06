import React from 'react';
import { StyleSheet, View, Pressable, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';

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
  const accent = color === 'orange' ? theme.colors.tertiary : theme.colors.primary;
  const borderColor = disabled ? theme.colors.forestGreen[100] : accent;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[styles.circle, { borderColor }, style]}
    >
      {selected && (
        <View
          style={[
            styles.dot,
            { backgroundColor: disabled ? theme.colors.forestGreen[100] : accent },
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
    backgroundColor: theme.colors.background.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
