import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/theme';
import { Screen, Spacer } from '@/components/layouts';
import { IconButton } from '@/components/buttons';
import { responsiveFontSize } from '@/utils/responsive';
import { BottomTabParamList } from '@/navigation/BottomTabNavigator';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type ProfileScreenNavigationProp = BottomTabNavigationProp<BottomTabParamList, 'ProfileTab'>;

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const SectionHeader = ({ title, onEdit }: { title: string; onEdit: () => void }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Pressable onPress={onEdit} style={styles.editButton}>
      <Text style={styles.editButtonText}>Edit</Text>
      <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={styles.editArrow}>
        <Path
          d="M5 12H19M19 12L12 5M19 12L12 19"
          stroke={theme.colors.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  </View>
);

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<'basic' | 'medical' | 'history'>('basic');
  const insets = useSafeAreaInsets();

  return (
    <Screen scrollable safeAreaBottom={false} contentContainerStyle={styles.screenContent}>
      {/* Custom Profile Header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 8 }]}>
        <IconButton
          type="back"
          accessibilityLabel="Go back"
          bg={theme.colors.primary}
          size={40}
          onPress={() => navigation.navigate('HomeTab')}
        />
        <Text style={styles.headerTitle}>Profile</Text>
        <IconButton
          type="custom"
          accessibilityLabel="Notifications"
          bg={theme.colors.primary}
          size={40}
          icon={
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 8A6 6 0 0 0 6 8C6 12 4 14 4 14H20C20 14 18 12 18 8M13.73 21a2 2 0 0 1-3.46 0"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          }
          onPress={() => {}}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Pressable
          onPress={() => setActiveTab('basic')}
          style={[styles.tabButton, activeTab === 'basic' && styles.activeTabButton]}
        >
          <Text style={[styles.tabText, activeTab === 'basic' && styles.activeTabText]}>
            Basic Info
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('medical')}
          style={[styles.tabButton, activeTab === 'medical' && styles.activeTabButton]}
        >
          <Text style={[styles.tabText, activeTab === 'medical' && styles.activeTabText]}>
            Medical
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('history')}
          style={[styles.tabButton, activeTab === 'history' && styles.activeTabButton]}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History
          </Text>
        </Pressable>
      </View>

      {activeTab === 'basic' && (
        <View>
          {/* Patient Card */}
          <View style={styles.patientCardContainer}>
            <LinearGradient
              colors={['#2E7D32', '#1B5E20']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.patientCard}
            >
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=150' }}
                style={styles.avatar}
              />
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>Kamala Sharma</Text>
                <Text style={styles.patientAge}>60 years old <Text style={styles.bullet}>•</Text> Female</Text>
              </View>
            </LinearGradient>
          </View>

          <Spacer size="md" />

          {/* Personal Details */}
          <SectionHeader title="Personal Details" onEdit={() => {}} />
          <View style={styles.detailsBlock}>
            <InfoRow label="Full Name" value="Kamala Sharma" />
            <InfoRow label="Saathi ID" value="Kamala" />
            <InfoRow label="Date of Birth" value="23/02/1996" />
            <InfoRow label="Gender" value="Female" />
            <InfoRow label="Living Situation" value="Alone" />
            <InfoRow label="Dependency Level" value="Independent" />
            <InfoRow label="Phone number" value="+91 98100 XXXXX" />
            <InfoRow label="Language" value="Hindi, English" />
          </View>

          <Spacer size="md" />

          {/* Home Address */}
          <SectionHeader title="Home Address" onEdit={() => {}} />
          <View style={styles.detailsBlock}>
            <InfoRow label="Home Address" value="123, Residency Road" />
            <InfoRow label="City" value="Mumbai" />
            <InfoRow label="State" value="Maharashtra" />
          </View>

          <Spacer size="md" />

          {/* Interests of Events */}
          <SectionHeader title="Interests of Events" onEdit={() => {}} />
          <View style={styles.interestsContainer}>
            {['Yoga', 'Art & Craft', 'Music', 'Party'].map((interest) => (
              <View key={interest} style={styles.interestBadge}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>

          <Spacer size="lg" />

          {/* List Contacts */}
          <View style={styles.contactHeaderContainer}>
            <Text style={styles.sectionTitle}>List Contacts</Text>
          </View>
          <Spacer size="sm" />
          
          <View style={styles.contactsContainer}>
            {/* Contact 1 */}
            <View style={styles.contactCard}>
              <View style={[styles.contactIndicatorBar, { backgroundColor: theme.colors.primary }]} />
              <View style={styles.contactContent}>
                <View style={styles.contactNameRow}>
                  <Text style={styles.contactName}>Suresh Sharma</Text>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                </View>
                <Spacer size="xs" />
                <Text style={styles.contactDetails}>Son <Text style={styles.bullet}>•</Text> +91 9876543210</Text>
              </View>
            </View>

            {/* Contact 2 */}
            <View style={styles.contactCard}>
              <View style={[styles.contactIndicatorBar, { backgroundColor: theme.colors.tertiary }]} />
              <View style={styles.contactContent}>
                <Text style={styles.contactName}>Dr. Apurva Pande</Text>
                <Spacer size="xs" />
                <Text style={styles.contactDetails}>Gastritis <Text style={styles.bullet}>•</Text> +91 9876543210</Text>
              </View>
            </View>

            {/* Contact 3 */}
            <View style={styles.contactCard}>
              <View style={[styles.contactIndicatorBar, { backgroundColor: theme.colors.tertiary }]} />
              <View style={styles.contactContent}>
                <Text style={styles.contactName}>Dr. S.L. Broor</Text>
                <Spacer size="xs" />
                <Text style={styles.contactDetails}>Primary Care Prov. <Text style={styles.bullet}>•</Text> +91 9876543210</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {activeTab === 'medical' && (
        <View style={styles.tabContentPlaceholder}>
          <Text style={styles.placeholderText}>Medical Information Screen</Text>
          <Text style={styles.placeholderSubtext}>Coming Soon</Text>
        </View>
      )}

      {activeTab === 'history' && (
        <View style={styles.tabContentPlaceholder}>
          <Text style={styles.placeholderText}>History Screen</Text>
          <Text style={styles.placeholderSubtext}>Coming Soon</Text>
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: 110, // Margin above absolute bottom tab bar
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(22),
    color: theme.colors.neutral[900],
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FF751F', // Orange theme.colors.tertiary
    borderRadius: 10,
    padding: 4,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(14),
    color: '#FFFFFF',
  },
  activeTabText: {
    color: '#FF751F',
  },
  patientCardContainer: {
    marginHorizontal: theme.spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginRight: theme.spacing.md,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: responsiveFontSize(20),
    color: '#FFFFFF',
  },
  patientAge: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(14),
    color: '#E0E0E0',
    marginTop: 4,
  },
  bullet: {
    fontFamily: theme.fonts.bold,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: responsiveFontSize(18),
    color: theme.colors.neutral[900],
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    fontFamily: theme.fonts.bold,
    fontSize: responsiveFontSize(15),
    color: theme.colors.primary,
    marginRight: 4,
  },
  editArrow: {
    marginTop: 1,
  },
  detailsBlock: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: theme.spacing.lg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  infoLabel: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(15),
    color: theme.colors.neutral[500],
  },
  infoValue: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(15),
    color: theme.colors.neutral[800],
    textAlign: 'right',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginHorizontal: theme.spacing.lg,
  },
  interestBadge: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  interestText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(14),
    color: theme.colors.neutral[700],
  },
  contactHeaderContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  contactsContainer: {
    marginHorizontal: theme.spacing.lg,
    gap: 12,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...theme.shadows.sm,
  },
  contactIndicatorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  contactContent: {
    flex: 1,
    paddingLeft: 4,
  },
  contactName: {
    fontFamily: theme.fonts.bold,
    fontSize: responsiveFontSize(16),
    color: theme.colors.neutral[900],
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verifiedBadge: {
    backgroundColor: '#EAF2EA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  verifiedText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: responsiveFontSize(11),
    color: theme.colors.primary,
  },
  contactDetails: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(14),
    color: theme.colors.neutral[600],
  },
  tabContentPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  placeholderText: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: responsiveFontSize(18),
    color: theme.colors.neutral[800],
  },
  placeholderSubtext: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(14),
    color: theme.colors.neutral[500],
    marginTop: 4,
  },
});

export default ProfileScreen;
