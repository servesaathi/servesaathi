import React from 'react';
import { StyleSheet, Text, View, Pressable, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';

interface SelectCardProps {
  label: string;
  icon?: React.ReactNode;
  selected?: boolean;
  orientation?: 'grid' | 'list';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

// "Select Input" from Figma Card Views (node 103:288) — icon + label selector card,
// used for service/category picking grids (grid) or single-column lists (list).
export const SelectCard: React.FC<SelectCardProps> = ({
  label,
  icon,
  selected = false,
  orientation = 'grid',
  onPress,
  style,
}) => {
  const isGrid = orientation === 'grid';

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        isGrid ? styles.gridCard : styles.listCard,
        selected ? styles.selected : styles.unselected,
        style,
      ]}
    >
      <View style={[styles.iconCircle, isGrid ? styles.iconCircleLarge : styles.iconCircleSmall]}>
        {icon}
      </View>
      <Text style={[styles.label, !isGrid && styles.listLabel]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
  },
  gridCard: {
    flexDirection: 'column',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
  },
  listCard: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
  },
  selected: {
    backgroundColor: theme.colors.background.orange,
    borderColor: theme.colors.tertiary,
  },
  unselected: {
    backgroundColor: theme.colors.background.base,
    borderColor: theme.colors.border.green,
  },
  iconCircle: {
    backgroundColor: theme.colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 200,
  },
  iconCircleLarge: {
    width: 64,
    height: 64,
  },
  iconCircleSmall: {
    width: 32,
    height: 32,
  },
  label: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[500],
    textAlign: 'center',
  },
  listLabel: {
    textAlign: 'left',
  },
});
