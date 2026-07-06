import React from 'react';
import { StyleSheet, Text, Pressable, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { Icon } from '@/components/icons';

interface FilterChipProps {
  label: string;
  selected?: boolean;
  showCloseIcon?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  style?: StyleProp<ViewStyle>;
}

// Merges "Selected Tab 2" and "Selected Chip" from Figma Card Views (node 103:288) —
// filter/tag chip with an optional selected (filled orange) state and remove (X) icon.
export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  selected = false,
  showCloseIcon = false,
  onPress,
  onRemove,
  style,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected ? styles.selected : styles.unselected, style]}
    >
      <Text style={[styles.label, selected ? styles.selectedText : styles.unselectedText]}>{label}</Text>
      {showCloseIcon && (
        <Pressable onPress={onRemove} hitSlop={8}>
          <Icon
            name="close"
            variant="outline"
            size={16}
            color={selected ? '#FFFFFF' : theme.colors.tertiary}
          />
        </Pressable>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    height: 32,
    borderWidth: 1.5,
    borderColor: theme.colors.tertiary,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
  },
  selected: {
    backgroundColor: theme.colors.tertiary,
  },
  unselected: {
    backgroundColor: theme.colors.background.orange,
  },
  label: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
  },
  selectedText: {
    color: '#FFFFFF',
  },
  unselectedText: {
    color: theme.colors.neutral[700],
  },
});
