import React from 'react';
import { StyleSheet, Text, Pressable, ViewStyle, TextStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';

/**
 * HyperlinkButton — text-only, no background
 * Default:  text #2E7D32  (Primary / Forest Green 500)
 * Pressed:  text #1C4B1E  (Forest Green 700)
 * Disabled: text #82B184  (Forest Green 300)
 */
interface HyperlinkButtonProps {
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  underline?: boolean;
  textColor?: string; // optional override; defaults to Forest Green 500
  style?: ViewStyle;
  labelStyle?: TextStyle;
  accessibilityLabel?: string;
}

export const HyperlinkButton: React.FC<HyperlinkButtonProps> = ({
  onPress,
  label,
  disabled = false,
  underline = false,
  textColor,
  style,
  labelStyle,
  accessibilityLabel,
}) => {
  const defaultColor = textColor ?? theme.colors.forestGreen[500];
  const pressedColor = theme.colors.forestGreen[700];
  const disabledColor = theme.colors.forestGreen[300];

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="link"
      accessibilityState={{ disabled }}
      accessibilityLabel={accessibilityLabel || label}
      style={({ pressed }) => [styles.base, { opacity: pressed && !disabled ? 0.8 : 1 }, style]}
    >
      {({ pressed }) => (
        <Text
          style={[
            styles.label,
            {
              color: disabled ? disabledColor : pressed ? pressedColor : defaultColor,
              textDecorationLine: underline ? 'underline' : 'none',
            },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  label: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    fontWeight: '500',
  },
});
