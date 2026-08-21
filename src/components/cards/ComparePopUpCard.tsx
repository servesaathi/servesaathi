import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  StyleProp,
  ViewStyle,
  LayoutChangeEvent,
} from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { Icon } from '@/components/icons';
import { Checkbox } from '@/components/inputs';

interface ComparePopUpCardProps {
  title: string;
  imageUri: string | number;
  location: string;
  distance?: string;
  rating: string;
  verified?: boolean;
  /** Small ribbon badge over the top-right of the image (Figma 1376:17195 "Badge"). */
  featured?: boolean;
  /** Source image's width/height ratio — when given, crops to the TOP of the image
   *  instead of centering, for portrait source images that would otherwise crop
   *  through the middle when squeezed into this wide 312x120 slot. */
  imageAspectRatio?: number;
  /** Compare checkbox row — hidden for plain listing contexts (e.g. Helpline). */
  showCompare?: boolean;
  compareChecked?: boolean;
  onCompareToggle?: () => void;
  onSeeDetailsPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

// "Compare Pop up Card" from Figma Card Views (node 103:288, fetched while building the
// Pop up / Compare feature) — individual comparison item card, used inside `CompareBar`.
// Figma's 312px card width is just "360 (frame) − 24 − 24 (padding)" for that one
// reference canvas — the card itself must stretch to fill its container on any
// device width, not hard-code 312, or real phones (390–430pt+) show extra slack
// beyond the intended 24px screen padding.
export const ComparePopUpCard: React.FC<ComparePopUpCardProps> = ({
  title,
  imageUri,
  location,
  distance,
  rating,
  verified = true,
  featured = false,
  imageAspectRatio,
  showCompare = true,
  compareChecked = false,
  onCompareToggle,
  onSeeDetailsPress,
  style,
}) => {
  const [frameWidth, setFrameWidth] = useState(0);

  const handleFrameLayout = (e: LayoutChangeEvent) => {
    if (imageAspectRatio) setFrameWidth(e.nativeEvent.layout.width);
  };

  return (
    <View style={[styles.card, style]}>
      <View style={styles.imageFrame} onLayout={handleFrameLayout}>
        <Image
          source={typeof imageUri === 'string' ? { uri: imageUri } : imageUri}
          style={
            // RN-web won't reliably derive a height from `aspectRatio` alone — compute
            // an explicit numeric height from the *measured* card width instead of
            // relying on CSS aspect-ratio sizing (or a hard-coded width).
            imageAspectRatio
              ? { width: frameWidth || '100%', height: frameWidth ? frameWidth / imageAspectRatio : 120 }
              : styles.image
          }
        />
        {featured && (
          <View style={styles.badge}>
            <Icon name="bookmark" variant="filled" size={16} color="#FFFFFF" />
          </View>
        )}
      </View>
      <View style={styles.field}>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {verified && <Icon name="verified" variant="filled" size={12} color={theme.colors.primary} />}
          </View>
          <View style={styles.subRow}>
            <Icon name="location" variant="outline" size={20} color={theme.colors.neutral[500]} />
            <Text style={styles.subText}>{location}</Text>
            {distance && (
              <>
                <Text style={[styles.subText, { color: theme.colors.forestGreen[600] }]}> · </Text>
                <Text style={styles.subText}>{distance}</Text>
              </>
            )}
          </View>
          {showCompare && (
            <View style={styles.compareRow}>
              <Checkbox checked={compareChecked} onPress={onCompareToggle} />
              <Text style={styles.subText}>Compare</Text>
            </View>
          )}
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
    width: '100%',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background.base,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  imageFrame: {
    height: 120,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 120,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 12,
    width: 25,
    height: 36,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
    backgroundColor: theme.colors.status.error,
    alignItems: 'center',
    justifyContent: 'center',
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
    // minHeight, not height: the rating text scales with the accessibility
    // font-size setting and must be able to grow the chip, not overflow it.
    minHeight: 24,
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
    // minHeight, not height: the label scales with the accessibility
    // font-size setting and must be able to grow the button, not overflow it.
    minHeight: 32,
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
