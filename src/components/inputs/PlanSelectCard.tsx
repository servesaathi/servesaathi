import React from 'react';
import { StyleSheet, Text, View, Pressable, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { RadioButton } from './RadioButton';
import { Icon } from '@/components/icons';

interface PlanSelectCardProps {
  label: string;
  price: string;
  selected: boolean;
  onPress?: () => void;
  onSeeBenefitsPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

// "Subscription Plan" from Figma Inputs & Forms (node 103:289) — radio-selectable
// pricing plan row.
export const PlanSelectCard: React.FC<PlanSelectCardProps> = ({
  label,
  price,
  selected,
  onPress,
  onSeeBenefitsPress,
  style,
}) => {
  const linkColor = selected ? theme.colors.vividOrange[700] : theme.colors.primary;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected ? styles.selected : styles.unselected, style]}
    >
      <View style={styles.info}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.price}>{price}</Text>
        <Pressable onPress={onSeeBenefitsPress} style={styles.benefitsRow}>
          <Text style={[styles.benefitsText, { color: linkColor }]}>See Benefits</Text>
          <Icon name="navigationRight" variant="outline" size={24} color={linkColor} />
        </Pressable>
      </View>
      <RadioButton selected={selected} onPress={onPress} color="orange" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.md,
  },
  selected: {
    backgroundColor: theme.colors.background.orange,
    borderColor: theme.colors.tertiary,
  },
  unselected: {
    backgroundColor: theme.colors.background.base,
    borderColor: theme.colors.border.green,
  },
  info: {
    gap: theme.spacing.xs,
  },
  label: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[500],
  },
  price: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
    color: theme.colors.neutral[700],
  },
  benefitsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitsText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(theme.typography.label.fontSize),
  },
});
