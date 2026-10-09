import React from 'react';
import { StyleSheet, Text, Pressable, ActivityIndicator, Platform } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { useThemeColors } from '@/hooks/useThemeColors';
import { darken } from '@/utils/color';
import { BaseButtonProps } from './types';

/**
 * LightButton — Figma "Mobile / Standard Buttons", Light hierarchy
 * (e.g. "Explore Elder Wellbeing", 3344:324237): G-Line fill (#D5E5D6),
 * 1.35px Forest Green/200 border, Forest Green/600 label. Colours come from
 * useThemeColors() like the other buttons, so it follows dark mode and high
 * contrast.
 */
export const LightButton: React.FC<BaseButtonProps> = ({
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
  const normalBg = colors.border.hairline;
  const pressedBg = darken(colors.border.hairline, 0.08);
  const textColor = disabled ? colors.text.muted : colors.accentPrimaryStrong;

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: loading }}
      accessibilityLabel={accessibilityLabel || label}
      style={({ pressed }) => [
        styles.base,
        size === 'small' ? styles.small : styles.medium,
        { backgroundColor: pressed && !disabled ? pressedBg : normalBg, borderColor: colors.border.card },
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
    borderWidth: 1.35,
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
