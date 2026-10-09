import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { useThemeColors } from '@/hooks/useThemeColors';

// Figma "Steps_Introduction" (3344:323367): 4px segments with an 8px gap,
// brand orange up to the current step and Vivid Orange/200 after it, then an
// "N of M" Small Caption in brand green.

type StepBarProps = {
  current: number;
  total: number;
  /** Screen-reader text, e.g. "Area 3 of 8". */
  label?: string;
};

export const StepBar: React.FC<StepBarProps> = ({ current, total, label }) => {
  const colors = useThemeColors();
  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? `Step ${current} of ${total}`}
      accessibilityValue={{ min: 1, max: total, now: current }}
    >
      <View style={styles.segments}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={[styles.segment, { backgroundColor: i < current ? colors.accentOrange : colors.accentOrangeMuted }]}
          />
        ))}
      </View>
      <Text style={[styles.count, { color: colors.accentPrimary }]}>
        {current} of {total}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  segments: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  count: {
    minWidth: 51,
    textAlign: 'center',
    fontFamily: theme.fonts.regular,
    fontSize: responsiveFontSize(14),
    lineHeight: 20,
  },
});

export default StepBar;
