import React from 'react';
import { StyleSheet, Text, Pressable, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { useThemeColors } from '@/hooks/useThemeColors';

interface DateCardProps {
  date: string; // e.g. "16"
  week: string; // e.g. "FRI"
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

// "Date Card" from Figma Card Views (node 103:288) — date-picker chip for booking flows.
export const DateCard: React.FC<DateCardProps> = ({ date, week, selected = false, onPress, style }) => {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        selected
          ? { backgroundColor: colors.background.orange, borderColor: colors.accentOrange }
          : { backgroundColor: colors.background.base, borderColor: colors.border.card },
        style,
      ]}
    >
      <Text style={[styles.date, { color: selected ? colors.text.strong : colors.text.muted }]}>{date}</Text>
      <Text style={[styles.week, { color: selected ? colors.text.strong : colors.text.muted }]}>{week}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    // min, not fixed: the day/weekday text scales with the accessibility
    // font-size setting and must be able to grow the card instead of
    // overflowing or squeezing it at large sizes.
    minWidth: 60,
    minHeight: 72,
    borderWidth: 1.5,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  date: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h3.fontSize),
  },
  week: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
  },
});
