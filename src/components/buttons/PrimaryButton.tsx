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
import { useThemeColors } from '@/hooks/useThemeColors';
import { darken } from '@/utils/color';
import { BaseButtonProps } from './types';

/**
 * PrimaryButton
 * Default/pressed/disabled bg all come from useThemeColors() so the button
 * follows dark mode and high contrast (Figma high contrast: bg #58A35B,
 * near-black label — see src/theme/palette.ts). In plain light mode these
 * resolve to the original static values (#2E7D32 / #ABCBAD / white label).
 * Pressed is computed by darkening the theme's accent (matching the original
 * #2E7D32 -> #256428 pressed step) rather than a fixed swatch, since every
 * theme has a different accent to darken.
 */
export const PrimaryButton: React.FC<BaseButtonProps> = ({
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
  const colors = useThemeColors();
  const normalBg = colors.accentPrimary;
  const pressedBg = darken(colors.accentPrimary, 0.14);
  const disabledBg = colors.border.card;
  const textColor = disabled ? theme.colors.neutral[50] : colors.textInverse;

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
            numberOfLines={1}
            adjustsFontSizeToFit
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
    borderRadius: theme.radius.control,
    // A label that's still too long after adjustsFontSizeToFit (e.g. this
    // button squeezed to half a footer row) must stay inside the pill
    // rather than bleed past its edge.
    overflow: 'hidden',
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
    flexShrink: 1,
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
