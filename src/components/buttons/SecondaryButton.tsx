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
 * SecondaryButton
 * Default:  bg #123214  (Forest Green 800)
 * Pressed:  bg #09190A  (Forest Green 900)
 * Disabled: bg #ABCBAD  (Forest Green 200)
 */
export const SecondaryButton: React.FC<BaseButtonProps> = ({
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
  const normalBg = theme.colors.forestGreen[800];
  const pressedBg = theme.colors.forestGreen[900];
  const disabledBg = theme.colors.forestGreen[200];
  const textColor = '#FFFFFF';

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: loading }}
      accessibilityLabel={accessibilityLabel || label}
      style={({ pressed }) => [
        styles.base,
        size === 'small' ? styles.small : styles.medium,
        { backgroundColor: disabled ? disabledBg : pressed ? pressedBg : normalBg },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {prefixIcon && prefixIcon}
          <Text
            style={[
              styles.label,
              size === 'small' ? styles.smallLabel : styles.mediumLabel,
              { color: textColor, marginLeft: prefixIcon ? theme.spacing.sm : 0 },
              labelStyle,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 6, // per design spec (theme.radius.sm is 8, doesn't match)
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
  },
  smallLabel: {
    fontSize: responsiveFontSize(theme.typography.smallCaption.fontSize),
  },
});
