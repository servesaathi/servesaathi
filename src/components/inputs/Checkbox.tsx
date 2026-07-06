import React from 'react';
import { StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { Icon } from '@/components/icons';

interface CheckboxProps {
  checked: boolean;
  onPress?: () => void;
  disabled?: boolean;
  color?: 'green' | 'orange';
  style?: StyleProp<ViewStyle>;
}

// "Checkbox Item Base" (Green/Orange) from Figma Inputs & Forms (node 103:289).
export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onPress,
  disabled = false,
  color = 'green',
  style,
}) => {
  const accent = color === 'orange' ? theme.colors.tertiary : theme.colors.primary;

  let backgroundColor = theme.colors.background.base;
  let borderColor = accent;
  if (checked) {
    backgroundColor = disabled ? theme.colors.forestGreen[100] : accent;
    borderColor = backgroundColor;
  } else if (disabled) {
    borderColor = theme.colors.forestGreen[100];
  }

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[styles.box, { backgroundColor, borderColor }, style]}
    >
      {checked && <Icon name="check" variant="outline" size={16} color="#FFFFFF" />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
