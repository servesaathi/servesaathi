import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Spacer } from '@/components/layouts';
import { PrimaryButton, SecondaryButton, IconButton } from '@/components/buttons';
import { Icon } from '@/components/icons';
import type { IconName } from '@/components/icons';
import { responsiveFontSize } from '@/utils/responsive';
import { useThemeColors } from '@/hooks/useThemeColors';

// "Request Details" (Figma 1256:24795) — confirmation, active request info and timeline.

const TIMELINE: Array<{ title: string; caption?: string; done?: boolean }> = [
  { title: 'Request Submitted', done: true },
  { title: 'Verified by Team' },
  { title: 'Callback Scheduled', caption: 'Afternoon (12-4)' },
  { title: 'Provider Contact', caption: 'Expected 4:00 PM' },
  { title: 'Follow-up', caption: 'Pending' },
];

interface InfoRowProps {
  icon: IconName;
  label: string;
  value: string;
  caption?: string;
  captionOrange?: string;
  directions?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, caption, captionOrange, directions }) => {
  const colors = useThemeColors();
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: colors.border.hairline }]}>
        <Icon name={icon} variant="outline" size={22} color={colors.accentPrimary} />
      </View>
      <View style={styles.infoText}>
        <Text style={[styles.infoLabel, { color: colors.text.primary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.text.strong }]}>{value}</Text>
        {caption && <Text style={[styles.infoCaption, { color: colors.text.tertiary }]}>{caption}</Text>}
        {captionOrange && <Text style={[styles.infoCaptionOrange, { color: colors.accentOrange }]}>{captionOrange}</Text>}
        {directions && (
          <Pressable style={styles.directionsRow}>
            <Icon name="send" variant="outline" size={16} color={colors.accentOrange} />
            <Text style={[styles.directionsText, { color: colors.accentOrange }]}>Get Directions</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

export const RequestDetailsScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'RequestDetails'>>();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  return (
    <View style={[styles.root, { backgroundColor: colors.background.layout }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + theme.spacing.lg }]}
      >
        <View style={styles.headerRow}>
          <IconButton type="back" bg={colors.accentPrimary} accessibilityLabel="Go back" onPress={() => navigation.goBack()} size={40} />
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Request Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <Spacer size="lg" />

        {/* Confirmation card with category footer bar */}
        <View style={[styles.receivedCard, { backgroundColor: colors.background.base }]}>
          <View style={styles.receivedBody}>
            <Text style={[styles.receivedTitle, { color: colors.text.primary }]}>Request Received</Text>
            <Text style={[styles.receivedText, { color: colors.text.secondary }]}>
              We are working on connecting you with the right care.
            </Text>
          </View>
          <View style={[styles.receivedFooter, { backgroundColor: colors.accentPrimary }]}>
            <Text style={[styles.receivedFooterText, { color: colors.textInverse }]}>Caregiver</Text>
          </View>
        </View>

        <Spacer size="xxl" />
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Active Requests</Text>
          <Pressable style={styles.editRow}>
            <Text style={[styles.editText, { color: colors.accentPrimary }]}>Edit</Text>
            <Icon name="navigationRight" variant="outline" size={20} color={colors.accentPrimary} />
          </Pressable>
        </View>
        <Spacer size="lg" />

        <InfoRow icon="phone" label="Method" value="Request Callback" />
        <InfoRow
          icon="government"
          label="Location"
          value="AgeWell Foundation"
          caption="Second Floor, M8A, Vinoba Puri, Block M, Part II, Lajpat Nagar, New Delhi, Delhi 110024"
          directions
        />
        <InfoRow icon="calendar" label="Date & Time" value="Wednesday, 15 May" captionOrange="3:00 PM" />
        <InfoRow icon="profile" label="Assigned Saathi" value="Priya Sharma" />
        <InfoRow icon="time" label="Submitted" value="10:02 AM" />

        <Spacer size="xl" />
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Request Timeline</Text>
        <Spacer size="lg" />

        <View>
          {TIMELINE.map((item, index) => (
            <View key={item.title} style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineDot,
                    { backgroundColor: item.done ? colors.accentOrange : colors.border.hairline },
                  ]}
                >
                  {item.done ? (
                    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <Path d="M4 12l5 5L20 6" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  ) : (
                    <Icon name="time" variant="outline" size={16} color={colors.accentPrimary} />
                  )}
                </View>
                {index < TIMELINE.length - 1 && <View style={[styles.timelineLine, { backgroundColor: colors.border.hairline }]} />}
              </View>
              <View style={styles.timelineText}>
                <Text style={[styles.timelineTitle, { color: colors.text.primary }]}>{item.title}</Text>
                {item.caption && <Text style={[styles.timelineCaption, { color: colors.text.tertiary }]}>{item.caption}</Text>}
              </View>
            </View>
          ))}
        </View>

        <Spacer size="xl" />
        <View style={styles.footerRow}>
          <SecondaryButton label="Reschedule" onPress={() => navigation.goBack()} style={styles.footerBtn} />
          <PrimaryButton label="Home" onPress={() => navigation.navigate('Home')} style={styles.footerBtn} />
        </View>
        <Spacer size="xl" />
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
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
    color: theme.colors.neutral[900],
  },
  receivedCard: {
    backgroundColor: theme.colors.background.base,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  receivedBody: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  receivedTitle: {
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h4.fontSize),
    color: theme.colors.neutral[900],
  },
  receivedText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    lineHeight: 22,
    color: theme.colors.neutral[700],
    marginTop: theme.spacing.xs,
  },
  receivedFooter: {
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  receivedFooterText: {
    fontFamily: theme.typography.smallCaption.fontFamily,
    fontSize: responsiveFontSize(theme.typography.smallCaption.fontSize),
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h3.fontSize),
    color: theme.colors.neutral[900],
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  editText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(14),
    color: theme.colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.forestGreen[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: theme.typography.h6.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h6.fontSize),
    color: theme.colors.neutral[900],
  },
  infoValue: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[800],
    marginTop: 1,
  },
  infoCaption: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    lineHeight: 20,
    color: theme.colors.neutral[600],
    marginTop: 2,
  },
  infoCaptionOrange: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.tertiary,
    marginTop: 2,
  },
  directionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  directionsText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(14),
    color: theme.colors.tertiary,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  timelineLeft: {
    alignItems: 'center',
  },
  timelineDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.forestGreen[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotDone: {
    backgroundColor: theme.colors.tertiary,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 16,
    backgroundColor: theme.colors.forestGreen[100],
  },
  timelineText: {
    flex: 1,
    paddingBottom: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  timelineTitle: {
    fontFamily: theme.typography.h6.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h6.fontSize),
    color: theme.colors.neutral[900],
  },
  timelineCaption: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: theme.colors.neutral[600],
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  footerBtn: {
    flex: 1,
    width: 'auto',
  },
});

export default RequestDetailsScreen;
