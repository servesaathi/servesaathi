import React, { useState } from 'react';
import { ActivityIndicator, Alert, Linking, StyleSheet, Text, View, ScrollView, Image, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootNavigationProp, RootRouteProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Spacer, SegmentedTabs } from '@/components/layouts';
import { PrimaryButton, SecondaryButton, IconButton } from '@/components/buttons';
import { StatusChip, FavoriteButton } from '@/components/cards';
import { Checkbox } from '@/components/inputs';
import { Icon } from '@/components/icons';
import { responsiveFontSize } from '@/utils/responsive';
import { formatExperience, formatRupees, formatVisits, getOrgImage } from '../data';
import { useOrganization, useProviderAvailability, useProviderProfile } from '../hooks/useProviders';
import { useIsFavorite, useToggleFavorite } from '../hooks/useFavorites';
import { ProviderReviews } from '../components/ProviderReviews';
import { getErrorMessage } from '@/api';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore, useIsGuestVerified } from '@/store/auth.store';
import { LeadCaptureModal, LeadCaptureMode } from '../components/LeadCaptureModal';
import { GuestBottomNav } from '../components/GuestBottomNav';

// "Caregivers - About / Reviews" (Figma 1256:24506 / 1256:24595).

const Star = ({ filled, mutedColor }: { filled: boolean; mutedColor: string }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? '#E7A500' : mutedColor}>
    <Path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17l-6.1 3.6 1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
  </Svg>
);

const CheckBadge = ({ color }: { color: string }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill={color}>
    <Path d="M12 1l2.4 2.1 3.1-.5 1.1 3 3 1.1-.5 3.1L23 12l-2.1 2.4.5 3.1-3 1.1-1.1 3-3.1-.5L12 23l-2.4-2.1-3.1.5-1.1-3-3-1.1.5-3.1L1 12l2.1-2.4-.5-3.1 3-1.1 1.1-3 3.1.5L12 1z" />
    <Path d="M8 12l3 3 5-6" stroke="#FFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const CaregiverDetailScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'CaregiverDetail'>>();
  const route = useRoute<RootRouteProp<'CaregiverDetail'>>();
  const orgId = route.params?.orgId;
  const org = useOrganization(orgId);
  const profileQuery = useProviderProfile(orgId);
  const profile = profileQuery.data;
  // Loaded on its own so a slow or failing call never holds up the rest of the page.
  const availabilityQuery = useProviderAvailability(orgId);
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  // Guest chrome (bottom nav + Compare row) shows for anyone browsing without an account.
  const isGuest = !useIsGuestVerified();
  // Favourites need a real session — a locally-registered visitor (no token) goes through OTP first.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isFav = useIsFavorite(orgId);
  const toggleFavorite = useToggleFavorite();
  const favPending = toggleFavorite.isPending && toggleFavorite.variables?.providerId === org.id;
  const [tab, setTab] = useState(0); // 0 About, 1 Review
  const [compareChecked, setCompareChecked] = useState(false);
  const [leadMode, setLeadMode] = useState<LeadCaptureMode | null>(null);

  const headerTitle = route.params?.serviceType ?? 'Caregiver';

  const handleBookVerified = () => {
    setLeadMode(null);
    navigation.navigate('RequestSetup', { orgId: org.id, isBooking: true });
  };

  const handleFavoritePress = () => {
    if (!isAuthenticated) {
      // Signed out: the 'save' popup verifies the phone, then saveAfterSignIn persists it.
      setLeadMode('save');
      return;
    }
    if (favPending) return;
    toggleFavorite.mutate(
      { providerId: org.id, save: !isFav },
      {
        onError: (err) =>
          Alert.alert(isFav ? "Couldn't remove from favorites" : "Couldn't save this provider", getErrorMessage(err)),
      },
    );
  };

  // Called by the 'save' popup once OTP has verified the phone, before it shows
  // "Saved to Favorites" — so the heart only fills after the POST succeeds.
  const saveAfterSignIn = async () => {
    if (!useAuthStore.getState().isAuthenticated) {
      // A brand-new number that guest/register couldn't create an account for
      // gets no token (see guestVerification.ts), so there's nothing to save against.
      throw new Error("Your number is verified, but we couldn't sign you in, so this provider wasn't saved. Please sign in and try again.");
    }
    await toggleFavorite.mutateAsync({ providerId: org.id, save: true });
  };

  // Callback/Book ask for name+mobile only to convert a guest into a real
  // account. Someone already registered has nothing left to ask — do the
  // underlying action directly instead of popping the lead-capture modal again.
  const handleLeadAction = (mode: Exclude<LeadCaptureMode, 'save'>) => {
    if (!isGuest) {
      if (mode === 'book') {
        handleBookVerified();
      } else {
        Alert.alert('Callback requested', "We've received your request. Our team will contact you shortly.");
      }
      return;
    }
    setLeadMode(mode);
  };

  const Pill = ({ text, half }: { text: string; half?: boolean }) => (
    <View style={[styles.pill, { backgroundColor: colors.background.base }, half && styles.pillHalf]}>
      <Text style={[styles.pillText, { color: colors.text.tertiary }]}>{text}</Text>
    </View>
  );

  // The profile drives every section below, so hold the page until it arrives.
  if (!profile) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background.layout }]}>
        <View style={[styles.headerRow, { paddingTop: insets.top + theme.spacing.lg }]}>
          <IconButton type="back" bg={colors.accentPrimary} accessibilityLabel="Go back" onPress={() => navigation.goBack()} size={40} />
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{headerTitle}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadState}>
          {profileQuery.isError ? (
            <>
              <Text style={[styles.bodyText, { color: colors.text.secondary, textAlign: 'center' }]}>
                {getErrorMessage(profileQuery.error)}
              </Text>
              <Spacer size="md" />
              <PrimaryButton label="Try Again" size="small" onPress={() => profileQuery.refetch()} />
            </>
          ) : (
            <ActivityIndicator size="large" color={colors.accentPrimary} />
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background.layout }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + theme.spacing.lg },
          isGuest && { paddingBottom: 96 + insets.bottom },
        ]}
      >
        <View style={styles.headerRow}>
          <IconButton type="back" bg={colors.accentPrimary} accessibilityLabel="Go back" onPress={() => navigation.goBack()} size={40} />
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{headerTitle}</Text>
          <View style={{ width: 40 }} />
        </View>

        <Spacer size="lg" />

        {/* Hero image */}
        <View style={styles.heroWrap}>
          <Image source={getOrgImage(org)} style={styles.hero} resizeMode="cover" />
          <View style={[styles.heroArrow, { backgroundColor: colors.accentOrange }]}>
            <Icon name="navigationRight" variant="outline" size={22} color="#FFFFFF" />
          </View>
        </View>

        <Spacer size="lg" />
        <View style={styles.inner}>
          <StatusChip
            label="Verified Partner"
            variant="softGreen"
            icon={<CheckBadge color={colors.accentPrimary} />}
            style={styles.verifiedChip}
          />

          <Spacer size="md" />
          <View style={styles.nameRow}>
            <Text style={[styles.orgName, { color: colors.text.primary }]}>{org.name}</Text>
            <FavoriteButton active={isFav} onPress={handleFavoritePress} />
          </View>

          <Spacer size="sm" />
          <Text style={[styles.address, { color: colors.text.secondary }]}>
            {profile.registeredAddress ?? profile.city}
          </Text>

          <Spacer size="sm" />
          <Pressable style={styles.directionsRow}>
            <Icon name="send" variant="outline" size={18} color={colors.accentOrange} />
            <Text style={[styles.directionsText, { color: colors.accentOrange }]}>Get Directions</Text>
          </Pressable>

          {isGuest && (
            <>
              <Spacer size="sm" />
              <Pressable style={styles.compareRow} onPress={() => setCompareChecked((v) => !v)}>
                <Checkbox checked={compareChecked} onPress={() => setCompareChecked((v) => !v)} />
                <Text style={[styles.compareText, { color: colors.accentPrimary }]}>Compare</Text>
              </Pressable>
            </>
          )}

          <Spacer size="lg" />
          {/* Stats */}
          <View style={[styles.statsRow, { backgroundColor: colors.background.base }]}>
            <View style={styles.statCell}>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>{org.rating ?? '-'}</Text>
              <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>Ratings</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border.hairline }]} />
            <View style={styles.statCell}>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>{formatExperience(profile.yearsOfExperience)}</Text>
              <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>Experience</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border.hairline }]} />
            <View style={styles.statCell}>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>{formatVisits(profile.experienceCount)}</Text>
              <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>Visits done</Text>
            </View>
          </View>

          <Spacer size="xl" />
          <SegmentedTabs options={['About', 'Review']} activeIndex={tab} onChange={setTab} variant="filled" />
          <Spacer size="xl" />

          {tab === 0 ? (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>About the facility</Text>
              <Spacer size="sm" />
              <Text style={[styles.bodyText, { color: colors.text.secondary }]}>
                {profile.aboutText ?? profile.bio ?? 'No description available yet.'}
              </Text>

              {profile.keyFacts.length > 0 && (
                <>
                  <Spacer size="lg" />
                  <Text style={[styles.keyFacts, { color: colors.text.primary }]}>Key facts:</Text>
                  {profile.keyFacts.map((fact) => (
                    <View key={fact} style={styles.bulletRow}>
                      <Text style={[styles.bullet, { color: colors.text.secondary }]}>•</Text>
                      <Text style={[styles.bodyText, { color: colors.text.secondary }]}>{fact}</Text>
                    </View>
                  ))}
                </>
              )}

              {profile.programs.length > 0 && (
                <>
                  <Spacer size="xxl" />
                  <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Programs &amp; Initiatives</Text>
                  <Spacer size="md" />
                  <View style={styles.pillCol}>
                    {profile.programs.map((p) => <Pill key={p.id} text={p.name} />)}
                  </View>
                </>
              )}

              {profile.servicesProvided.length > 0 && (
                <>
                  <Spacer size="xxl" />
                  <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Services Provided</Text>
                  <Spacer size="md" />
                  <View style={styles.pillGrid}>
                    {profile.servicesProvided.map((s) => <Pill key={s.id} text={s.serviceName} half />)}
                  </View>
                </>
              )}

              {profile.recognitions.length > 0 && (
                <>
                  <Spacer size="xxl" />
                  <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Recognitions &amp; Accreditations</Text>
                  <Spacer size="md" />
                  <View style={styles.pillCol}>
                    {profile.recognitions.map((r) => <Pill key={r.title} text={r.title} />)}
                  </View>
                </>
              )}

              <Spacer size="xxl" />
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Pricing</Text>
              <Spacer size="md" />
              {profile.servicesProvided.length > 0 ? (
                <View style={styles.pillCol}>
                  {profile.servicesProvided.map((s) => (
                    <Pill
                      key={s.id}
                      text={`${s.serviceName} — ${formatRupees(s.effectivePrice)}${s.priceTypeLabel ? ` ${s.priceTypeLabel.toLowerCase()}` : ''}`}
                    />
                  ))}
                </View>
              ) : (
                <Pill text="Pricing on request" />
              )}
            </>
          ) : (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Availability this week</Text>
              <Spacer size="md" />
              {availabilityQuery.isPending ? (
                <ActivityIndicator size="small" color={colors.accentPrimary} style={styles.availabilityLoading} />
              ) : availabilityQuery.data ? (
                availabilityQuery.data.map((slot) => (
                  <View key={slot.day} style={styles.dayRow}>
                    <Text style={[styles.dayName, { color: colors.text.strong }]}>{slot.day}</Text>
                    <Text style={[styles.dayHours, { color: slot.off ? colors.accentOrange : colors.text.tertiary }]}>{slot.hours}</Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.availabilityEmpty, { color: colors.text.tertiary }]}>
                  {availabilityQuery.isError
                    ? "Availability couldn't be loaded right now."
                    : "This provider hasn't published their hours yet."}
                </Text>
              )}

              <Spacer size="xl" />
              <ProviderReviews providerId={String(profile.id)} />
            </>
          )}

          <Spacer size="xxl" />
          <PrimaryButton label="Request a callback" onPress={() => handleLeadAction('callback')} />
          <Spacer size="md" />
          <PrimaryButton label="Book" onPress={() => handleLeadAction('book')} />
          <Spacer size="md" />
          {!!profile.websiteUrl && (
            <>
              <SecondaryButton label="Website" onPress={() => Linking.openURL(profile.websiteUrl!)} />
              <Spacer size="xl" />
            </>
          )}
        </View>
      </ScrollView>

      <LeadCaptureModal
        visible={leadMode !== null}
        mode={leadMode ?? 'callback'}
        onClose={() => setLeadMode(null)}
        onBeforeDone={leadMode === 'save' ? saveAfterSignIn : undefined}
        onVerified={() => {
          if (leadMode === 'book') handleBookVerified();
        }}
      />

      {isGuest && <GuestBottomNav onLockedPress={() => navigation.navigate('GuestBrowse')} />}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background.layout,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
  },
  headerTitle: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
    color: theme.colors.neutral[900],
  },
  loadState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  heroWrap: {
    position: 'relative',
  },
  hero: {
    width: '100%',
    height: 180,
  },
  heroArrow: {
    position: 'absolute',
    right: theme.spacing.xl,
    bottom: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  compareText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(theme.typography.label.fontSize),
    color: theme.colors.primary,
  },
  inner: {
    paddingHorizontal: theme.spacing.xl,
  },
  verifiedChip: {
    alignSelf: 'flex-start',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orgName: {
    flex: 1,
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
    color: theme.colors.neutral[900],
  },
  address: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    lineHeight: 22,
    color: theme.colors.neutral[700],
  },
  directionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  directionsText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(theme.typography.label.fontSize),
    color: theme.colors.tertiary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.base,
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.md,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.forestGreen[100],
  },
  statValue: {
    fontFamily: theme.typography.h5.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h5.fontSize),
    color: theme.colors.neutral[900],
  },
  statLabel: {
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodySmall.fontSize),
    color: theme.colors.neutral[600],
  },
  sectionTitle: {
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h4.fontSize),
    color: theme.colors.neutral[900],
  },
  bodyText: {
    flex: 1,
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    lineHeight: 24,
    color: theme.colors.neutral[700],
  },
  keyFacts: {
    fontFamily: theme.typography.h5.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h5.fontSize),
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing.xs,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.md,
  },
  bullet: {
    fontFamily: theme.fonts.bold,
    fontSize: responsiveFontSize(16),
    color: theme.colors.neutral[700],
  },
  pillCol: {
    gap: theme.spacing.sm,
  },
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  pill: {
    backgroundColor: theme.colors.background.base,
    borderRadius: theme.radius.control,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  pillHalf: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  pillText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: theme.colors.neutral[600],
    textAlign: 'center',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  dayName: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[800],
  },
  dayHours: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[600],
  },
  dayOff: {
    color: theme.colors.tertiary,
  },
  availabilityLoading: {
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.sm,
  },
  availabilityEmpty: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    paddingVertical: theme.spacing.sm,
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
    color: theme.colors.primary,
  },
  reviewCard: {
    backgroundColor: theme.colors.background.base,
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
    backgroundColor: theme.colors.forestGreen[100],
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
    color: theme.colors.neutral[900],
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodySmall.fontSize),
    color: theme.colors.neutral[600],
  },
});

export default CaregiverDetailScreen;
