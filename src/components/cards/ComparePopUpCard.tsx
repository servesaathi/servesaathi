import React from 'react';
import { StyleSheet, Text, View, Image, Pressable, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { Icon } from '@/components/icons';
import { Checkbox } from '@/components/inputs';

interface ComparePopUpCardProps {
  title: string;
  imageUri: string;
  location: string;
  distance: string;
  rating: string;
  verified?: boolean;
  compareChecked: boolean;
  onCompareToggle: () => void;
  onSeeDetailsPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

// "Compare Pop up Card" from Figma Card Views (node 103:288, fetched while building the
// Pop up / Compare feature) — individual comparison item card, used inside `CompareBar`.
export const ComparePopUpCard: React.FC<ComparePopUpCardProps> = ({
  title,
  imageUri,
  location,
  distance,
  rating,
  verified = true,
  compareChecked,
  onCompareToggle,
  onSeeDetailsPress,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <View style={styles.field}>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {verified && <Icon name="verified" variant="filled" size={12} color={theme.colors.primary} />}
          </View>
          <View style={styles.subRow}>
            <Icon name="location" variant="outline" size={20} color={theme.colors.neutral[500]} />
            <Text style={styles.subText}>{location}</Text>
            <Text style={[styles.subText, { color: theme.colors.forestGreen[600] }]}> · </Text>
            <Text style={styles.subText}>{distance}</Text>
          </View>
          <View style={styles.compareRow}>
            <Checkbox checked={compareChecked} onPress={onCompareToggle} />
            <Text style={styles.subText}>Compare</Text>
          </View>
        </View>
        <View style={styles.rightCol}>
          <View style={styles.ratingChip}>
            <Icon name="star" variant="filled" size={16} color={theme.colors.vividOrange[600]} />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
          <Pressable onPress={onSeeDetailsPress} style={styles.detailsButton}>
            <Text style={styles.detailsButtonText}>See details</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 312,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background.base,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  image: {
    width: '100%',
    height: 120,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  info: {
    gap: theme.spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  title: {
    fontFamily: theme.typography.h5.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h5.fontSize),
    color: theme.colors.neutral[700],
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[500],
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    height: 24,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.background.orange,
  },
  ratingText: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(theme.typography.caption.fontSize),
    color: theme.colors.vividOrange[600],
  },
  detailsButton: {
    height: 32,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.forestGreen[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsButtonText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(14),
    color: '#FFFFFF',
  },
});
