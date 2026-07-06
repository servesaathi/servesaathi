import React from 'react';
import { StyleSheet, Text, Pressable, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';

interface DateCardProps {
  date: string; // e.g. "16"
  week: string; // e.g. "FRI"
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

// "Date Card" from Figma Card Views (node 103:288) — date-picker chip for booking flows.
export const DateCard: React.FC<DateCardProps> = ({ date, week, selected = false, onPress, style }) => {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected ? styles.selected : styles.unselected, style]}
    >
      <Text style={[styles.date, selected ? styles.selectedText : styles.unselectedText]}>{date}</Text>
      <Text style={[styles.week, selected ? styles.selectedText : styles.unselectedText]}>{week}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 60,
    height: 72,
    borderWidth: 1.5,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  selected: {
    backgroundColor: theme.colors.background.orange,
    borderColor: theme.colors.tertiary,
  },
  unselected: {
    backgroundColor: theme.colors.background.base,
    borderColor: theme.colors.border.green,
  },
  selectedText: {
    color: theme.colors.neutral[700],
  },
  unselectedText: {
    color: theme.colors.neutral[500],
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
