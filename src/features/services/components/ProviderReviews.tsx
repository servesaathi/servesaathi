import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Spacer } from '@/components/layouts';
import { DestructiveButton, PrimaryButton } from '@/components/buttons';
import { TextInput } from '@/components/inputs';
import { Icon } from '@/components/icons';
import { responsiveFontSize } from '@/utils/responsive';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/store/auth.store';
import { getErrorMessage, type Review } from '@/api';
import {
  ALL_REVIEWS_LIMIT,
  RECENT_REVIEWS_LIMIT,
  useDeleteReview,
  useMyReview,
  useProviderReviews,
  useSaveReview,
} from '../hooks/useProviders';

// "Recent Feedback" + the customer's own review (add / edit / delete) for the
// Review tab of CaregiverDetailScreen. Backed by /reviews/provider/{id} — see
// api/services/review.service.ts for the contract (one review per customer,
// PUT = create-or-update).

const MAX_COMMENT_LENGTH = 500;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-03-28T…" -> "Mar 28, 2026" */
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

const Star = ({ filled, size = 16, mutedColor }: { filled: boolean; size?: number; mutedColor: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#E7A500' : mutedColor}>
    <Path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17l-6.1 3.6 1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
  </Svg>
);

interface Props {
  providerId: string;
}

export const ProviderReviews: React.FC<Props> = ({ providerId }) => {
  const navigation = useNavigation<RootNavigationProp<'CaregiverDetail'>>();
  const colors = useThemeColors();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [showAll, setShowAll] = useState(false);
  const reviewsQuery = useProviderReviews(providerId, showAll ? ALL_REVIEWS_LIMIT : RECENT_REVIEWS_LIMIT);
  const myReviewQuery = useMyReview(providerId);
  const saveReview = useSaveReview(providerId);
  const deleteReview = useDeleteReview(providerId);

  const myReview = myReviewQuery.data ?? null;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Fill the form from the saved review once it loads (or clear it after a delete).
  useEffect(() => {
    setRating(myReview?.rating ?? 0);
    setComment(myReview?.comment ?? '');
  }, [myReview?.id, myReview?.updatedAt]);

  const dirty = myReview ? rating !== myReview.rating || comment.trim() !== (myReview.comment ?? '') : rating > 0;

  const handleSubmit = async () => {
    if (rating < 1) {
      setFormError('Please choose a star rating.');
      return;
    }
    setFormError(null);
    try {
      const trimmed = comment.trim();
      await saveReview.mutateAsync({ rating, ...(trimmed ? { comment: trimmed } : {}) });
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete your review?', 'This removes your rating and comment for this provider.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setFormError(null);
          try {
            await deleteReview.mutateAsync();
          } catch (err) {
            setFormError(getErrorMessage(err));
          }
        },
      },
    ]);
  };

  const renderReview = (review: Review) => (
    <View key={review.id} style={[styles.reviewCard, { backgroundColor: colors.background.base }]}>
      <View style={styles.reviewHeader}>
        <View style={[styles.reviewAvatar, { backgroundColor: colors.border.hairline }]}>
          <Icon name="profile" variant="outline" size={20} color={colors.accentPrimary} />
        </View>
        <View style={styles.reviewHeadText}>
          <Text style={[styles.reviewName, { color: colors.text.primary }]}>
            {/* customerName is blank in the PUT / GET-me payloads, so an own review may have none. */}
            {myReview?.id === review.id
              ? review.customerName
                ? `${review.customerName} (You)`
                : 'You'
              : review.customerName || 'ServeSaathi user'}
          </Text>
          <View style={styles.starsRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} filled={i < review.rating} mutedColor={colors.border.card} />
            ))}
          </View>
        </View>
        <Text style={[styles.reviewDate, { color: colors.text.tertiary }]}>{formatDate(review.createdAt)}</Text>
      </View>
      {!!review.comment && (
        <>
          <Spacer size="sm" />
          <Text style={[styles.bodyText, { color: colors.text.secondary }]}>{review.comment}</Text>
        </>
      )}
    </View>
  );

  const total = reviewsQuery.data?.meta.total ?? 0;
  const canViewAll = !showAll && total > RECENT_REVIEWS_LIMIT;
  const busy = saveReview.isPending || deleteReview.isPending;

  return (
    <View>
      {/* Write / edit / delete my review */}
      <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
        {myReview ? 'Your review' : 'Rate this provider'}
      </Text>
      <Spacer size="md" />
      {!isAuthenticated ? (
        <View style={[styles.formCard, { backgroundColor: colors.background.base }]}>
          <Text style={[styles.bodyText, { color: colors.text.secondary }]}>
            Sign in to rate this provider and share your experience.
          </Text>
          <Spacer size="md" />
          <PrimaryButton label="Sign in to review" onPress={() => navigation.navigate('Login', { intent: 'login' })} />
        </View>
      ) : (
        <View style={[styles.formCard, { backgroundColor: colors.background.base }]}>
          <View style={styles.starPicker}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                onPress={() => setRating(n)}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`}
                accessibilityState={{ selected: rating === n }}
              >
                <Star filled={n <= rating} size={36} mutedColor={colors.border.card} />
              </Pressable>
            ))}
          </View>
          <Spacer size="md" />
          <TextInput
            label="Comment (optional)"
            placeholder="Tell others about your experience"
            value={comment}
            onChangeText={setComment}
            maxLength={MAX_COMMENT_LENGTH}
            multiline
            inputStyle={styles.commentInput}
          />
          {!!formError && <Text style={[styles.errorText, { color: colors.accentOrange }]}>{formError}</Text>}
          <Spacer size="md" />
          <PrimaryButton
            label={myReview ? 'Update review' : 'Submit review'}
            onPress={handleSubmit}
            loading={saveReview.isPending}
            disabled={busy || !dirty}
          />
          {myReview && (
            <>
              <Spacer size="sm" />
              <DestructiveButton
                label="Delete review"
                onPress={handleDelete}
                loading={deleteReview.isPending}
                disabled={busy}
              />
            </>
          )}
        </View>
      )}

      {/* Public feedback */}
      <Spacer size="xl" />
      <View style={styles.feedbackHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Recent Feedback</Text>
        {canViewAll && (
          <Pressable style={styles.viewAll} onPress={() => setShowAll(true)} accessibilityRole="button">
            <Text style={[styles.viewAllText, { color: colors.accentPrimary }]}>View All</Text>
            <Icon name="navigationRight" variant="outline" size={20} color={colors.accentPrimary} />
          </Pressable>
        )}
      </View>
      <Spacer size="md" />
      {reviewsQuery.isPending ? (
        <ActivityIndicator color={colors.accentPrimary} />
      ) : reviewsQuery.isError ? (
        <View style={styles.centered}>
          <Text style={[styles.bodyText, { color: colors.text.secondary }]}>{getErrorMessage(reviewsQuery.error)}</Text>
          <Spacer size="md" />
          <PrimaryButton label="Try Again" size="small" onPress={() => reviewsQuery.refetch()} />
        </View>
      ) : reviewsQuery.data.items.length === 0 ? (
        <Text style={[styles.bodyText, { color: colors.text.secondary }]}>
          No reviews yet. Be the first to share your experience.
        </Text>
      ) : (
        reviewsQuery.data.items.map(renderReview)
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h4.fontSize),
  },
  bodyText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    lineHeight: 24,
  },
  formCard: {
    borderRadius: theme.radius.sm,
    padding: theme.spacing.lg,
  },
  starPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  commentInput: {
    minHeight: 96,
  },
  errorText: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(14),
  },
  centered: {
    alignItems: 'center',
  },
  reviewCard: {
    borderRadius: theme.radius.sm,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewHeadText: {
    flex: 1,
    gap: 2,
  },
  reviewName: {
    fontFamily: theme.typography.h6.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h6.fontSize),
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodySmall.fontSize),
  },
});

export default ProviderReviews;
