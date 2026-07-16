import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';

interface FieldCardProps {
  subheadline: string;
  caption?: string;
  time?: string;
  icon?: React.ReactNode;
  styleColor?: 'green' | 'orange';
  style?: StyleProp<ViewStyle>;
}

// "Field Card View" from Figma Card Views (node 103:288) — left-accent-border row card
// with an icon avatar, used for appointment/schedule list items.
export const FieldCard: React.FC<FieldCardProps> = ({
  subheadline,
  caption,
  time,
  icon,
  styleColor = 'green',
  style,
}) => {
  const isOrange = styleColor === 'orange';
  const accentColor = isOrange ? theme.colors.tertiary : theme.colors.primary;
  const iconBg = isOrange ? theme.colors.vividOrange[100] : theme.colors.primary;

  return (
    <View style={[styles.card, { borderLeftColor: accentColor }, style]}>
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={styles.text}>
        <View>
          <Text style={styles.subheadline}>{subheadline}</Text>
          {caption && <Text style={styles.caption}>{caption}</Text>}
        </View>
        {time && <Text style={styles.caption}>{time}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.background.base,
    borderLeftWidth: 4,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  subheadline: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[700],
  },
  caption: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[500],
  },
});
