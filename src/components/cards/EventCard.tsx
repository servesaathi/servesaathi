import React from 'react';
import { StyleSheet, Text, View, Image, ImageBackground, Pressable, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { StatusChip } from './StatusChip';
import { Icon } from '@/components/icons';

interface EventCardProps {
  title: string;
  time: string;
  imageUri: string;
  dateDay: string; // e.g. "17"
  dateMonth: string; // e.g. "APR"
  location?: string; // e.g. "Zoom Room" — mutually exclusive with priceLabel
  priceLabel?: string; // e.g. "₹ 300"
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

// "Upcoming Event" card from Figma Card Views (node 103:288) — event/appointment card
// with a cover image, date badge, and either a location or a price chip.
export const EventCard: React.FC<EventCardProps> = ({
  title,
  time,
  imageUri,
  dateDay,
  dateMonth,
  location,
  priceLabel,
  onPress,
  style,
}) => {
  const Container = onPress ? Pressable : View;

  return (
    <Container onPress={onPress} style={[styles.card, style]}>
      <ImageBackground source={{ uri: imageUri }} style={styles.image} imageStyle={styles.imageRadius}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateDay}>{dateDay}</Text>
          <Text style={styles.dateMonth}>{dateMonth}</Text>
        </View>
      </ImageBackground>
      <View style={styles.field}>
        <View style={styles.textCol}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
        {priceLabel ? (
          <StatusChip label={priceLabel} variant="primary" />
        ) : location ? (
          <View style={styles.locationRow}>
            <Icon name="location" variant="outline" size={20} color={theme.colors.forestGreen[500]} />
            <Text style={styles.location}>{location}</Text>
          </View>
        ) : null}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background.base,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  image: {
    height: 140,
    justifyContent: 'flex-start',
    padding: theme.spacing.sm,
  },
  imageRadius: {
    borderTopLeftRadius: theme.radius.sm,
    borderTopRightRadius: theme.radius.sm,
  },
  dateBadge: {
    width: 48,
    height: 56,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateDay: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: '#FFFFFF',
  },
  dateMonth: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: '#FFFFFF',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  textCol: {
    gap: theme.spacing.xs,
  },
  title: {
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h4.fontSize),
    color: theme.colors.neutral[700],
  },
  time: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[500],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  location: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[500],
  },
});
