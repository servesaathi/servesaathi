import React from 'react';
import { StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { Icon } from '@/components/icons';

interface CheckCircleProps {
  checked: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

// "Checkbox Item Base" Checkcircle type from Figma Inputs & Forms (node 103:289) — green only.
export const CheckCircle: React.FC<CheckCircleProps> = ({ checked, onPress, disabled = false, style }) => {
  const backgroundColor = checked
    ? disabled
      ? theme.colors.forestGreen[100]
      : theme.colors.primary
    : theme.colors.background.base;
  const borderColor = disabled ? theme.colors.forestGreen[100] : theme.colors.primary;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[styles.circle, { backgroundColor, borderColor }, style]}
    >
      {checked && <Icon name="check" variant="outline" size={12} color="#FFFFFF" />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  circle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
