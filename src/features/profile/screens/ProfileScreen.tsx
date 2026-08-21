import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/theme';
import { Screen, Spacer } from '@/components/layouts';
import { IconButton } from '@/components/buttons';
import { responsiveFontSize } from '@/utils/responsive';
import { BottomTabParamList } from '@/navigation/BottomTabNavigator';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  careProfileService,
  customerService,
  type Address,
  type CareProfile,
  type FamilyMember,
  type HealthProfile,
} from '@/api';
import { useUserStore } from '@/store/user.store';
import { ageFromDob } from '@/utils/profile';
import { ProfileEditSheet, type EditSection } from '../components/ProfileEditSheet';
import { FamilyMemberSheet } from '../components/FamilyMemberSheet';
import { useThemeColors } from '@/hooks/useThemeColors';
import type { ThemePalette } from '@/theme/palette';

type ProfileScreenNavigationProp = BottomTabNavigationProp<BottomTabParamList, 'ProfileTab'>;

const AVATAR_FALLBACK = 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=150';

// "1966-04-29" → "29/04/1966"
const formatDob = (iso?: string) => {
  if (!iso) return '—';
  const [year, month, day] = iso.split('T')[0].split('-');
  return year && month && day ? `${day}/${month}/${year}` : '—';
};

const InfoRow = ({ label, value, colors }: { label: string; value: string; colors: ThemePalette }) => (
  <View style={styles.infoRow}>
    <Text style={[styles.infoLabel, { color: colors.text.muted }]}>{label}</Text>
    <Text style={[styles.infoValue, { color: colors.text.strong }]}>{value}</Text>
  </View>
);

const SectionHeader = ({
  title,
  onEdit,
  colors,
}: {
  title: string;
  onEdit: () => void;
  colors: ThemePalette;
}) => (
  <View style={styles.sectionHeader}>
    <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{title}</Text>
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
  const colors = useThemeColors();
  const userProfile = useUserStore((s) => s.profile);
  const [careProfile, setCareProfile] = useState<CareProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editSection, setEditSection] = useState<EditSection | null>(null);
  const [contactSheetOpen, setContactSheetOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoadError(null);
      const [profile, addressList, members, health] = await Promise.all([
        careProfileService.getCareProfile(),
        customerService.getAddresses(),
        careProfileService.getFamilyMembers(),
        // Health may not exist yet for users who skipped that onboarding step.
        careProfileService.getHealthProfile().catch(() => null),
      ]);
      setCareProfile(profile);
      setAddresses(addressList);
      setFamilyMembers(members);
      setHealthProfile(health);
    } catch {
      setLoadError('Unable to load your profile right now.');
    }
  }, []);

  // Refetch on focus so edits made elsewhere (profile creation, settings) show up.
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleSaved = () => {
    setEditSection(null);
    loadData();
  };

  const openAddContact = () => {
    setEditingMember(null);
    setContactSheetOpen(true);
  };

  const openEditContact = (member: FamilyMember) => {
    setEditingMember(member);
    setContactSheetOpen(true);
  };

  const handleContactSaved = () => {
    setContactSheetOpen(false);
    setEditingMember(null);
    loadData();
  };

  const displayName = careProfile?.preferredName || userProfile?.name || '—';
  const age = ageFromDob(careProfile?.dateOfBirth);
  const homeAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const interests = careProfile?.interests ?? [];

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
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Profile</Text>
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
          {loadError && <Text style={styles.loadError}>{loadError}</Text>}

          {/* Patient Card */}
          <View style={styles.patientCardContainer}>
            <LinearGradient
              colors={['#2E7D32', '#1B5E20']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.patientCard}
            >
              <Image
                source={{ uri: careProfile?.avatarUrl || AVATAR_FALLBACK }}
                style={styles.avatar}
              />
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{displayName}</Text>
                <Text style={styles.patientAge}>
                  {age !== null ? `${age} years old` : '—'}
                  {careProfile?.gender?.name ? (
                    <>
                      {' '}
                      <Text style={styles.bullet}>•</Text> {careProfile.gender.name}
                    </>
                  ) : null}
                </Text>
              </View>
            </LinearGradient>
          </View>

          <Spacer size="md" />

          {/* Personal Details */}
          <SectionHeader title="Personal Details" onEdit={() => setEditSection('details')} colors={colors} />
          <View style={[styles.detailsBlock, { backgroundColor: colors.background.base }]}>
            <InfoRow label="Full Name" value={userProfile?.name || displayName} colors={colors} />
            <InfoRow label="Preferred Name" value={careProfile?.preferredName || '—'} colors={colors} />
            <InfoRow label="Date of Birth" value={formatDob(careProfile?.dateOfBirth)} colors={colors} />
            <InfoRow label="Gender" value={careProfile?.gender?.name || '—'} colors={colors} />
            <InfoRow label="Living Situation" value={careProfile?.livingSituation?.name || '—'} colors={colors} />
            <InfoRow label="Dependency Level" value={careProfile?.dependencyLevel?.name || '—'} colors={colors} />
            <InfoRow label="Phone number" value={userProfile?.phone || '—'} colors={colors} />
            <InfoRow label="Email" value={userProfile?.email || '—'} colors={colors} />
          </View>

          <Spacer size="md" />

          {/* Home Address */}
          <SectionHeader title="Home Address" onEdit={() => setEditSection('address')} colors={colors} />
          <View style={[styles.detailsBlock, { backgroundColor: colors.background.base }]}>
            <InfoRow
              label={homeAddress?.label || 'Home Address'}
              value={
                homeAddress
                  ? [homeAddress.line1, homeAddress.line2].filter(Boolean).join(', ')
                  : '—'
              }
              colors={colors}
            />
            <InfoRow label="City" value={homeAddress?.city || '—'} colors={colors} />
            <InfoRow label="State" value={homeAddress?.state || '—'} colors={colors} />
            <InfoRow label="PIN Code" value={homeAddress?.pincode || '—'} colors={colors} />
          </View>

          <Spacer size="md" />

          {/* Interests of Events */}
          <SectionHeader title="Interests of Events" onEdit={() => setEditSection('interests')} colors={colors} />
          <View style={styles.interestsContainer}>
            {interests.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.text.muted }]}>No interests added yet.</Text>
            ) : (
              interests.map((interest) => (
                <View key={interest.id} style={[styles.interestBadge, { backgroundColor: colors.background.base }]}>
                  <Text style={[styles.interestText, { color: colors.text.secondary }]}>{interest.name}</Text>
                </View>
              ))
            )}
          </View>

          <Spacer size="lg" />

          {/* List Contacts — tap a card to edit, "+ Add" to create */}
          <View style={styles.contactHeaderContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>List Contacts</Text>
            <Pressable onPress={openAddContact} style={styles.editButton}>
              <Text style={styles.editButtonText}>+ Add</Text>
            </Pressable>
          </View>
          <Spacer size="sm" />

          <View style={styles.contactsContainer}>
            {familyMembers.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.text.muted }]}>No contacts added yet.</Text>
            ) : (
              familyMembers.map((member) => (
                <Pressable
                  key={member.id}
                  style={[styles.contactCard, { backgroundColor: colors.background.base }]}
                  onPress={() => openEditContact(member)}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit contact ${member.firstName} ${member.lastName}`}
                >
                  <View
                    style={[
                      styles.contactIndicatorBar,
                      {
                        backgroundColor:
                          member.status === 'accepted'
                            ? theme.colors.primary
                            : theme.colors.tertiary,
                      },
                    ]}
                  />
                  <View style={styles.contactContent}>
                    <View style={styles.contactNameRow}>
                      <Text style={[styles.contactName, { color: colors.text.primary }]}>
                        {`${member.firstName} ${member.lastName}`.trim()}
                      </Text>
                      {member.status === 'accepted' && (
                        <View style={styles.verifiedBadge}>
                          <Text style={styles.verifiedText}>Verified</Text>
                        </View>
                      )}
                    </View>
                    <Spacer size="xs" />
                    <Text style={[styles.contactDetails, { color: colors.text.tertiary }]}>
                      {member.relationship?.name ?? 'Family'}{' '}
                      <Text style={styles.bullet}>•</Text> {member.phone}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </View>
      )}

      {activeTab === 'medical' && (
        <View>
          {healthProfile ? (
            <>
              <View style={styles.contactHeaderContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Medical Conditions</Text>
              </View>
              <Spacer size="sm" />
              <View style={styles.interestsContainer}>
                {healthProfile.medicalConditions.length === 0 ? (
                  <Text style={[styles.emptyText, { color: colors.text.muted }]}>No conditions recorded.</Text>
                ) : (
                  healthProfile.medicalConditions.map((condition) => (
                    <View key={condition.id} style={[styles.interestBadge, { backgroundColor: colors.background.base }]}>
                      <Text style={[styles.interestText, { color: colors.text.secondary }]}>{condition.name}</Text>
                    </View>
                  ))
                )}
              </View>

              <Spacer size="md" />

              <View style={styles.contactHeaderContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Health Details</Text>
              </View>
              <Spacer size="sm" />
              <View style={[styles.detailsBlock, { backgroundColor: colors.background.base }]}>
                <InfoRow
                  label="Mobility Support"
                  value={healthProfile.mobilitySupport?.name || '—'}
                  colors={colors}
                />
                <InfoRow
                  label="Cognitive Condition"
                  value={healthProfile.cognitiveCondition?.name || '—'}
                  colors={colors}
                />
                <InfoRow
                  label="Regular Medication"
                  value={healthProfile.medicationRequired ? 'Yes' : 'No'}
                  colors={colors}
                />
                <InfoRow label="Notes" value={healthProfile.notes || '—'} colors={colors} />
                {healthProfile.otherConditionNote ? (
                  <InfoRow label="Other Condition" value={healthProfile.otherConditionNote} colors={colors} />
                ) : null}
              </View>
            </>
          ) : (
            <View style={styles.tabContentPlaceholder}>
              <Text style={[styles.placeholderText, { color: colors.text.strong }]}>No medical information yet</Text>
              <Text style={[styles.placeholderSubtext, { color: colors.text.muted }]}>
                Complete the health step in profile setup to see it here.
              </Text>
            </View>
          )}
        </View>
      )}

      {activeTab === 'history' && (
        <View style={styles.tabContentPlaceholder}>
          <Text style={[styles.placeholderText, { color: colors.text.strong }]}>History Screen</Text>
          <Text style={[styles.placeholderSubtext, { color: colors.text.muted }]}>Coming Soon</Text>
        </View>
      )}

      <ProfileEditSheet
        section={editSection}
        careProfile={careProfile}
        address={homeAddress ?? null}
        onClose={() => setEditSection(null)}
        onSaved={handleSaved}
      />

      <FamilyMemberSheet
        visible={contactSheetOpen}
        member={editingMember}
        onClose={() => {
          setContactSheetOpen(false);
          setEditingMember(null);
        }}
        onSaved={handleContactSaved}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  loadError: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(14),
    color: theme.colors.status.error,
    textAlign: 'center',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(14),
    color: theme.colors.neutral[500],
  },
});

export default ProfileScreen;
