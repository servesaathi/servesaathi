import React from 'react';
import { StyleSheet, Text, Pressable, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { Checkbox } from './Checkbox';
import { useThemeColors } from '@/hooks/useThemeColors';

interface SelectableChipProps {
  label: string;
  selected: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

// "Select Input" from Figma Inputs & Forms (node 103:289) — a label + embedded checkbox
// chip button, orange accent (distinct from the icon-based `SelectCard` in cards/).
export const SelectableChip: React.FC<SelectableChipProps> = ({ label, selected, onPress, style }) => {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.background.orange : colors.background.base,
          borderColor: selected ? colors.accentOrange : colors.border.card,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color: selected ? colors.text.primary : colors.text.secondary }]}>
        {label}
      </Text>
      <Checkbox checked={selected} color="orange" onPress={onPress} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // no internal gap — space-between separates label and checkbox, and long labels
    // ("Kidney Disease") need the full width to stay on one line like Figma
    borderWidth: 1.5,
    borderRadius: theme.radius.sm,
    // Figma spec is 16px, but "Kidney Disease" measures exactly the available 100px
    // at that padding (a rounding tie that wraps); 12px guarantees one line everywhere
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  label: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
  },
});
