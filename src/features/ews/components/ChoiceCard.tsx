import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import { Checkbox } from '@/components/inputs';
import { responsiveFontSize } from '@/utils/responsive';
import { useThemeColors } from '@/hooks/useThemeColors';

// Figma "Select Input" with the orange "Checkbox Item Base" (3344:323389):
// white card, 1.5px G-Line border, 6px radius, 16/12 padding, 16/22 label in
// Neutral/Tertiary, 20px orange checkbox on the right. Figma only draws the
// unselected state; selected keeps the shape with a brand-green border, the
// label in primary text and a filled orange box (the shared Checkbox). It is a
// single-answer radio for screen readers.

type ChoiceCardProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export const ChoiceCard: React.FC<ChoiceCardProps> = ({ label, selected, onPress }) => {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.background.base,
          borderColor: selected ? colors.accentPrimary : pressed ? colors.border.card : colors.border.hairline,
        },
      ]}
    >
      <Text style={[styles.label, { color: selected ? colors.text.primary : colors.text.muted }]}>{label}</Text>
      <View pointerEvents="none" style={styles.box}>
        <Checkbox checked={selected} color="orange" />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderWidth: 1.5,
    borderRadius: theme.radius.control,
  },
  label: {
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: responsiveFontSize(16),
    lineHeight: 22,
  },
  box: {
    paddingVertical: 1,
  },
});

export default ChoiceCard;
