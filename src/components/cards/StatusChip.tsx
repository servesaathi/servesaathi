import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { useThemeColors } from '@/hooks/useThemeColors';
import type { ThemePalette } from '@/theme/palette';

export type StatusChipVariant = 'primary' | 'softOrange' | 'softGreen' | 'rating';

interface StatusChipProps {
  label: string;
  variant?: StatusChipVariant;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  bgColor?: string;
  textColor?: string;
}

// Computed per-render (not a module constant) so it reacts to dark mode/high
// contrast via colors.
const variantStyles = (colors: ThemePalette): Record<StatusChipVariant, { bg: string; text: string }> => ({
  primary: { bg: colors.accentPrimary, text: colors.textInverse },
  softOrange: { bg: theme.colors.vividOrange[100], text: theme.colors.vividOrange[700] },
  softGreen: { bg: colors.background.layout, text: colors.accentPrimary },
  rating: { bg: colors.background.orange, text: colors.accentOrange },
});

// "Pop-over Chip" from Figma Card Views (node 103:288) — small status pill used across
// event/organization/profile cards (e.g. price, "Verified", "Due Soon", rating).
export const StatusChip: React.FC<StatusChipProps> = ({
  label,
  variant = 'primary',
  icon,
  style,
  bgColor,
  textColor,
}) => {
  const colors = useThemeColors();
  const { bg, text } = variantStyles(colors)[variant];

  return (
    <View style={[styles.chip, { backgroundColor: bgColor ?? bg }, style]}>
      {icon}
      <Text style={[styles.label, { color: textColor ?? text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    // minHeight, not height: the label scales with the accessibility
    // font-size setting and must be able to grow the chip, not overflow it.
    minHeight: 24,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(theme.typography.caption.fontSize),
  },
});
