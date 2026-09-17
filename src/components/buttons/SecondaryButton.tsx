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
 * SecondaryButton
 * bg/label come from useThemeColors(): light resolves to the original
 * #123214/white, but high contrast redefines this fill to a pale mint
 * (#D5EBD6) with a near-black label — not just a darker shade — per the
 * Figma high-contrast spec (see palette.ts's secondarySurface).
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
  const colors = useThemeColors();
  const normalBg = colors.secondarySurface;
  const pressedBg = darken(colors.secondarySurface, 0.14);
  const disabledBg = colors.border.card;
  const textColor = colors.textInverse;

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
