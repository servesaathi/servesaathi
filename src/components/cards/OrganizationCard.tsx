import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { StatusChip, StatusChipVariant } from './StatusChip';

export type OrganizationCardStatus = 'event' | 'status' | 'category';

interface OrganizationCardProps {
  title: string; // eventName / subheadline
  place: string;
  date: string;
  time?: string;
  icon?: React.ReactNode;
  status?: OrganizationCardStatus;
  chipLabel?: string; // e.g. "In Progress"
  chipVariant?: StatusChipVariant;
  categoryLabel?: string; // footer bar text, category status only
  style?: StyleProp<ViewStyle>;
}

// "Organization Card Views" from Figma Card Views (node 103:288) — appointment/organization
// listing row with icon, title/place/date·time, a status chip, and (category variant) a
// full-width footer label bar.
export const OrganizationCard: React.FC<OrganizationCardProps> = ({
  title,
  place,
  date,
  time,
  icon,
  status = 'event',
  chipLabel,
  chipVariant = 'primary',
  categoryLabel,
  style,
}) => {
  const isCategory = status === 'category';
  const isStatus = status === 'status';

  return (
    <View style={style}>
      <View
        style={[
          styles.field,
          isCategory ? styles.categoryField : isStatus ? styles.statusField : styles.eventField,
        ]}
      >
        <View style={styles.iconCircle}>{icon}</View>
        <View style={styles.info}>
          <View style={styles.textCol}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.place}>{place}</Text>
          </View>
          <View style={styles.subRow}>
            <Text style={styles.place}>{date}</Text>
            {time && (
              <>
                <Text style={[styles.place, { color: theme.colors.primary }]}> · </Text>
                <Text style={styles.place}>{time}</Text>
              </>
            )}
          </View>
          {chipLabel && !isCategory && <StatusChip label={chipLabel} variant={chipVariant} />}
        </View>
      </View>
      {isCategory && categoryLabel && (
        <View style={styles.categoryFooter}>
          <Text style={styles.categoryText}>{categoryLabel}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.background.base,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  eventField: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
  },
  statusField: {
    borderBottomWidth: 4,
    borderBottomColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
  },
  categoryField: {
    borderTopLeftRadius: theme.radius.sm,
    borderTopRightRadius: theme.radius.sm,
  },
  iconCircle: {
    // Hi-fi "Our Service" cards: light circle with a green ring and green icon
    width: 40,
    height: 40,
    borderRadius: 200,
    backgroundColor: theme.colors.background.layout,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  textCol: {
    gap: theme.spacing.xs,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[700],
  },
  place: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[500],
  },
  categoryFooter: {
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: theme.radius.sm,
    borderBottomRightRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
    alignItems: 'center',
  },
  categoryText: {
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodySmall.fontSize),
    color: '#FFFFFF',
  },
});
