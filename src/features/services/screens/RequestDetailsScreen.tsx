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

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, caption, captionOrange, directions }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <Icon name={icon} variant="outline" size={22} color={theme.colors.primary} />
    </View>
    <View style={styles.infoText}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
      {caption && <Text style={styles.infoCaption}>{caption}</Text>}
      {captionOrange && <Text style={styles.infoCaptionOrange}>{captionOrange}</Text>}
      {directions && (
        <Pressable style={styles.directionsRow}>
          <Icon name="send" variant="outline" size={16} color={theme.colors.tertiary} />
          <Text style={styles.directionsText}>Get Directions</Text>
        </Pressable>
      )}
    </View>
  </View>
);

export const RequestDetailsScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'RequestDetails'>>();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + theme.spacing.lg }]}
      >
        <View style={styles.headerRow}>
          <IconButton type="back" accessibilityLabel="Go back" onPress={() => navigation.goBack()} size={40} />
          <Text style={styles.headerTitle}>Request Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <Spacer size="lg" />

        {/* Confirmation card with category footer bar */}
        <View style={styles.receivedCard}>
          <View style={styles.receivedBody}>
            <Text style={styles.receivedTitle}>Request Received</Text>
            <Text style={styles.receivedText}>
              We are working on connecting you with the right care.
            </Text>
          </View>
          <View style={styles.receivedFooter}>
            <Text style={styles.receivedFooterText}>Caregiver</Text>
          </View>
        </View>

        <Spacer size="xxl" />
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Requests</Text>
          <Pressable style={styles.editRow}>
            <Text style={styles.editText}>Edit</Text>
            <Icon name="navigationRight" variant="outline" size={20} color={theme.colors.primary} />
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
        <Text style={styles.sectionTitle}>Request Timeline</Text>
        <Spacer size="lg" />

        <View>
          {TIMELINE.map((item, index) => (
            <View key={item.title} style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, item.done && styles.timelineDotDone]}>
                  {item.done ? (
                    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <Path d="M4 12l5 5L20 6" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  ) : (
                    <Icon name="time" variant="outline" size={16} color={theme.colors.primary} />
                  )}
                </View>
                {index < TIMELINE.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={styles.timelineText}>
                <Text style={styles.timelineTitle}>{item.title}</Text>
                {item.caption && <Text style={styles.timelineCaption}>{item.caption}</Text>}
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
    borderRadius: theme.radius.md,
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
