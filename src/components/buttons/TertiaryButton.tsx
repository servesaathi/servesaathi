import React from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { BaseButtonProps } from './types';

/**
 * TertiaryButton — grey outlined style
 * Default:  bg #E8E8E8 (Neutral 100) + border 1.35px #D2D1D1 (Neutral 200), text #4B4946 (Neutral 700)
 * Pressed:  bg #A5A4A3 (Neutral 300), text white (matches Primary/Secondary pressed style)
 * Disabled: bg #E8E8E8 (Neutral 100) + border 1.35px #E8E8E8 (Neutral 100, invisible), text #A5A4A3 (Neutral 300)
 */
export const TertiaryButton: React.FC<BaseButtonProps> = ({
  onPress,
  label,
  disabled = false,
  loading = false,
  size = 'medium',
  style,
  labelStyle,
  accessibilityLabel,
  prefixIcon,
}) => {
  const normalBg = theme.colors.neutral[100];
  const pressedBg = theme.colors.neutral[300];
  const disabledBg = theme.colors.neutral[100];
  const textColor = theme.colors.neutral[700];
  const pressedTextColor = '#FFFFFF';
  const disabledTextColor = theme.colors.neutral[300];

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: loading }}
      accessibilityLabel={accessibilityLabel || label}
      style={({ pressed }) => [
        styles.base,
        size === 'small' ? styles.small : styles.medium,
        {
          backgroundColor: disabled ? disabledBg : pressed ? pressedBg : normalBg,
          borderColor: disabled
            ? theme.colors.neutral[100]   // invisible border when disabled
            : pressed
              ? theme.colors.neutral[300]   // hide border when pressed
              : theme.colors.neutral[200],  // visible border in default state
        },
        style,
      ]}
    >
      {({ pressed }) =>
        loading ? (
          <ActivityIndicator
            size="small"
            color={disabled ? disabledTextColor : pressed ? pressedTextColor : textColor}
          />
        ) : (
          <>
            {prefixIcon && prefixIcon}
            <Text
              style={[
                styles.label,
                size === 'small' ? styles.smallLabel : styles.mediumLabel,
                {
                  color: disabled ? disabledTextColor : pressed ? pressedTextColor : textColor,
                  marginLeft: prefixIcon ? theme.spacing.sm : 0,
                },
                labelStyle,
              ]}
            >
              {label}
            </Text>
          </>
        )
      }
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 6, // per design spec (theme.radius.sm is 8, doesn't match)
    borderWidth: 1.35,
  },
  medium: {
    height: 48,
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  small: {
    height: 32,
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.md,
  },
  label: {
    fontFamily: theme.typography.label.fontFamily,
    textAlign: 'center',
    ...Platform.select({ web: { userSelect: 'none' } }),
  },
  mediumLabel: {
    fontSize: responsiveFontSize(theme.typography.label.fontSize),
    fontWeight: '600',
  },
  smallLabel: {
    fontSize: responsiveFontSize(theme.typography.smallCaption.fontSize),
    fontWeight: '600',
  },
});
