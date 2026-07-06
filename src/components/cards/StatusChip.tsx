import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';

export type StatusChipVariant = 'primary' | 'softOrange' | 'softGreen' | 'rating';

interface StatusChipProps {
  label: string;
  variant?: StatusChipVariant;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  bgColor?: string;
  textColor?: string;
}

const VARIANT_STYLES: Record<StatusChipVariant, { bg: string; text: string }> = {
  primary: { bg: theme.colors.forestGreen[500], text: '#FFFFFF' },
  softOrange: { bg: theme.colors.vividOrange[100], text: theme.colors.vividOrange[700] },
  softGreen: { bg: theme.colors.background.layout, text: theme.colors.forestGreen[700] },
  rating: { bg: theme.colors.background.orange, text: theme.colors.vividOrange[600] },
};

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
  const { bg, text } = VARIANT_STYLES[variant];

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
    height: 24,
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
