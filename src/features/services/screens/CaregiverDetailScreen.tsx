import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootNavigationProp, RootRouteProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Spacer, SegmentedTabs } from '@/components/layouts';
import { PrimaryButton, SecondaryButton, IconButton } from '@/components/buttons';
import { StatusChip, FavoriteButton } from '@/components/cards';
import { Icon } from '@/components/icons';
import { responsiveFontSize } from '@/utils/responsive';
import { getOrganization } from '../data';

// "Caregivers - About / Reviews" (Figma 1256:24506 / 1256:24595).

const ABOUT_TEXT =
  'AgeWell Foundation is a national-level NGO established in 1999, headquartered in New Delhi, working across 640 districts of India.';
const KEY_FACTS = [
  '7,500 primary volunteers and 80,000 secondary volunteers',
  'Interacts with 25,000+ elderly daily',
  'Recognized by UN-DPI',
];
const PROGRAMS = [
  'Weekly visits by trained couselors',
  '24/7 Phone support',
  'Helpline Services',
  'Emotional & Social Support',
  'Assistance Servies',
  'Guidance on legal, financial, health',
];
const SERVICES_PROVIDED = [
  'Companionship', 'Counselling', 'Regular check-in', 'Volunteer visits',
  'Escort for errands', 'Phone Support', 'Hospital Visits', 'Hospital Visits',
];
const RECOGNITIONS = [
  'UN ECOSOC Special Consultative',
  'UN-DPI Associate NGO Status',
  'Member of Planning Commission Working Groups',
];
const AVAILABILITY: Array<{ day: string; hours: string; off?: boolean }> = [
  { day: 'Monday', hours: '9 AM - 6 PM' },
  { day: 'Tuesday', hours: '9 AM - 6 PM' },
  { day: 'Wednesday', hours: 'Not available', off: true },
  { day: 'Thursday', hours: '9 AM - 6 PM' },
  { day: 'Friday', hours: '9 AM - 6 PM' },
  { day: 'Saturday', hours: '9 AM - 6 PM' },
  { day: 'Sunday', hours: 'Not available', off: true },
];
const REVIEWS = [
  {
    name: 'Lalitha R,', date: 'Mar 28, 2026', stars: 5,
    text: 'Punctual and respectful. Brought medicine on time. Would prefer same Saathi again.',
  },
  {
    name: 'Suresh K', date: 'Mar 20, 2026', stars: 4,
    text: 'Very patient and helpful. My mother-in-law feels comfortable with him. He helped her with UPI payment, doctor appointment and other.',
  },
];

const Star = ({ filled }: { filled: boolean }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? '#E7A500' : theme.colors.neutral[200]}>
    <Path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17l-6.1 3.6 1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
  </Svg>
);

const CheckBadge = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill={theme.colors.primary}>
    <Path d="M12 1l2.4 2.1 3.1-.5 1.1 3 3 1.1-.5 3.1L23 12l-2.1 2.4.5 3.1-3 1.1-1.1 3-3.1-.5L12 23l-2.4-2.1-3.1.5-1.1-3-3-1.1.5-3.1L1 12l2.1-2.4-.5-3.1 3-1.1 1.1-3 3.1.5L12 1z" />
    <Path d="M8 12l3 3 5-6" stroke="#FFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const CaregiverDetailScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'CaregiverDetail'>>();
  const route = useRoute<RootRouteProp<'CaregiverDetail'>>();
  const org = getOrganization(route.params?.orgId ?? 'agewell');
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState(0); // 0 About, 1 Review
  const [fav, setFav] = useState(false);

  const Pill = ({ text, half }: { text: string; half?: boolean }) => (
    <View style={[styles.pill, half && styles.pillHalf]}>
      <Text style={styles.pillText}>{text}</Text>
    </View>
  );

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + theme.spacing.lg }]}
      >
        <View style={styles.headerRow}>
          <IconButton type="back" accessibilityLabel="Go back" onPress={() => navigation.goBack()} size={40} />
          <Text style={styles.headerTitle}>Caregiver</Text>
          <View style={{ width: 40 }} />
        </View>

        <Spacer size="lg" />

        {/* Hero image */}
        <View style={styles.heroWrap}>
          {org.image ? (
            <Image source={org.image} style={styles.hero} resizeMode="cover" />
          ) : (
            <View style={[styles.hero, { backgroundColor: theme.colors.neutral[200] }]} />
          )}
        </View>

        <Spacer size="lg" />
        <View style={styles.inner}>
          <StatusChip
            label="Verified Partner"
            variant="softGreen"
            icon={<CheckBadge />}
            style={styles.verifiedChip}
          />

          <Spacer size="md" />
          <View style={styles.nameRow}>
            <Text style={styles.orgName}>{org.name}</Text>
            <FavoriteButton active={fav} onPress={() => setFav((v) => !v)} />
          </View>

          <Spacer size="sm" />
          <Text style={styles.address}>
            Second Floor, M8A, Vinoba Puri, Block M, Part II, Lajpat Nagar, New Delhi, Delhi 110024, India
          </Text>

          <Spacer size="sm" />
          <Pressable style={styles.directionsRow}>
            <Icon name="send" variant="outline" size={18} color={theme.colors.tertiary} />
            <Text style={styles.directionsText}>Get Directions</Text>
          </Pressable>

          <Spacer size="lg" />
          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCell}>
              <Text style={styles.statValue}>{org.rating ?? '-'}</Text>
              <Text style={styles.statLabel}>Ratings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Text style={styles.statValue}>27+ yrs</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Text style={styles.statValue}>25,000+</Text>
              <Text style={styles.statLabel}>Visits done</Text>
            </View>
          </View>

          <Spacer size="xl" />
          <SegmentedTabs options={['About', 'Review']} activeIndex={tab} onChange={setTab} variant="filled" />
          <Spacer size="xl" />

          {tab === 0 ? (
            <>
              <Text style={styles.sectionTitle}>About the facility</Text>
              <Spacer size="sm" />
              <Text style={styles.bodyText}>{ABOUT_TEXT}</Text>

              <Spacer size="lg" />
              <Text style={styles.keyFacts}>Key facts:</Text>
              {KEY_FACTS.map((fact) => (
                <View key={fact} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bodyText}>{fact}</Text>
                </View>
              ))}

              <Spacer size="xxl" />
              <Text style={styles.sectionTitle}>Programs &amp; Initiatives</Text>
              <Spacer size="md" />
              <View style={styles.pillCol}>
                {PROGRAMS.map((p) => <Pill key={p} text={p} />)}
              </View>

              <Spacer size="xxl" />
              <Text style={styles.sectionTitle}>Services Provided</Text>
              <Spacer size="md" />
              <View style={styles.pillGrid}>
                {SERVICES_PROVIDED.map((s, i) => <Pill key={`${s}-${i}`} text={s} half />)}
              </View>

              <Spacer size="xxl" />
              <Text style={styles.sectionTitle}>Recognitions &amp; Accreditations</Text>
              <Spacer size="md" />
              <View style={styles.pillCol}>
                {RECOGNITIONS.map((r) => <Pill key={r} text={r} />)}
              </View>

              <Spacer size="xxl" />
              <Text style={styles.sectionTitle}>Pricing</Text>
              <Spacer size="md" />
              <Pill text="FREE (government-supported helpline), Training programs subsidized" />
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Availability this week</Text>
              <Spacer size="md" />
              {AVAILABILITY.map((slot) => (
                <View key={slot.day} style={styles.dayRow}>
                  <Text style={styles.dayName}>{slot.day}</Text>
                  <Text style={[styles.dayHours, slot.off && styles.dayOff]}>{slot.hours}</Text>
                </View>
              ))}

              <Spacer size="xl" />
              <View style={styles.feedbackHeader}>
                <Text style={styles.sectionTitle}>Recent Feedback</Text>
                <Pressable style={styles.viewAll}>
                  <Text style={styles.viewAllText}>View All</Text>
                  <Icon name="navigationRight" variant="outline" size={20} color={theme.colors.primary} />
                </Pressable>
              </View>
              <Spacer size="md" />
              {REVIEWS.map((review) => (
                <View key={review.name} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Icon name="profile" variant="outline" size={20} color={theme.colors.primary} />
                    </View>
                    <View style={styles.reviewHeadText}>
                      <Text style={styles.reviewName}>{review.name}</Text>
                      <View style={styles.starsRow}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} filled={i < review.stars} />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                  <Spacer size="sm" />
                  <Text style={styles.bodyText}>{review.text}</Text>
                </View>
              ))}
            </>
          )}

          <Spacer size="xxl" />
          <SecondaryButton label="Website" onPress={() => {}} />
          <Spacer size="md" />
          <PrimaryButton label="Request" onPress={() => navigation.navigate('RequestSetup', { orgId: org.id })} />
          <Spacer size="xl" />
        </View>
      </ScrollView>
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
  heroWrap: {
    position: 'relative',
  },
  hero: {
    width: '100%',
    height: 180,
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
    borderRadius: theme.radius.sm,
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
    borderRadius: theme.radius.md,
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
