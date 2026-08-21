import React from 'react';
import { StyleSheet, Text, View, Pressable, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { RadioButton } from './RadioButton';
import { Icon } from '@/components/icons';
import { useThemeColors } from '@/hooks/useThemeColors';

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
  const colors = useThemeColors();
  const linkColor = selected ? colors.accentOrange : colors.accentPrimary;

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
      <View style={styles.info}>
        <Text style={[styles.label, { color: colors.text.muted }]}>{label}</Text>
        <Text style={[styles.price, { color: colors.text.secondary }]}>{price}</Text>
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
  info: {
    gap: theme.spacing.xs,
  },
  label: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
  },
  price: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
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
