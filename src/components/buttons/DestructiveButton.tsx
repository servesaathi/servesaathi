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
 * DestructiveButton — red outlined / filled style
 * Default:  bg #FEF2F2 (red-input) + border 1px #FEE2E2 (red-bg)
 * Pressed:  bg #DC2626 (red) — becomes solid red fill
 * Disabled: bg #FEF2F2 (red-input) + border 1.35px #FEE2E2 (red-bg)
 */
export const DestructiveButton: React.FC<BaseButtonProps> = ({
  onPress,
  label,
  disabled = false,
  loading = false,
  size = 'medium',
  style,
  labelStyle,
  accessibilityLabel,
}) => {
  const defaultBg = theme.colors.status.errorBg;
  const pressedBg = theme.colors.status.error;
  const disabledBg = theme.colors.status.errorBg;
  const defaultTextColor = theme.colors.status.error;
  const pressedTextColor = '#FFFFFF';
  const disabledTextColor = theme.colors.forestGreen[200];

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
          backgroundColor: disabled ? disabledBg : pressed ? pressedBg : defaultBg,
          borderColor: theme.colors.status.errorBorder,
        },
        style,
      ]}
    >
      {({ pressed }) =>
        loading ? (
          <ActivityIndicator
            size="small"
            color={disabled ? disabledTextColor : pressed ? pressedTextColor : defaultTextColor}
          />
        ) : (
          <Text
            style={[
              styles.label,
              size === 'small' ? styles.smallLabel : styles.mediumLabel,
              {
                color: disabled
                  ? disabledTextColor
                  : pressed
                  ? pressedTextColor
                  : defaultTextColor,
              },
              labelStyle,
            ]}
          >
            {label}
          </Text>
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
    borderRadius: theme.radius.sm, // 6px per design spec
    borderWidth: 1,
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
