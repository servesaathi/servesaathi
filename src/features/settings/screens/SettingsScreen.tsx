import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View, Image, Pressable, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { ageFromDob } from '@/utils/profile';
import { Screen, Header, Spacer, SettingsMenuItem } from '@/components/layouts';
import type { SettingsMenuItemVariant } from '@/components/layouts';
import { Icon } from '@/components/icons';
import type { IconName } from '@/components/icons';
import { useUserStore } from '@/store/user.store';
import { careProfileService, type CareProfile } from '@/api';
import ProfileCardBg from '../../../../assets/illustrations/settings_profile_card_bg.svg';

interface MenuItemConfig {
  label: string;
  icon: IconName;
  variant?: SettingsMenuItemVariant;
  onPress?: () => void;
}

const ICON_SIZE = 28; // Figma: 28px glyph inside the 36px circle

// "Settings" (Figma 1432:38979) — profile card, Myself/Parent role toggle, and grouped
// menu rows. Reached only from the Setting tab, so the header's back arrow is inert
// (matches the Figma frame, which reuses the same header chrome as every other screen).
export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const name = useUserStore((s) => s.profile?.name) ?? 'Kamala Sharma';
  const [careProfile, setCareProfile] = useState<CareProfile | null>(null);
  const [role, setRole] = useState<'myself' | 'parent'>('myself');

  // Refetch on focus so edits made on Edit Profile / elsewhere show up immediately.
  useFocusEffect(
    useCallback(() => {
      careProfileService.getCareProfile().then(setCareProfile).catch(() => {});
    }, [])
  );

  const age = ageFromDob(careProfile?.dateOfBirth);

  const groups: { title: string; items: MenuItemConfig[] }[] = [
    {
      title: 'Account',
      items: [
        {
          label: 'Edit Profile',
          icon: 'profile',
          onPress: () => navigation.navigate('EditProfile'),
        },
        { label: 'Change Password', icon: 'key' },
        { label: 'Payment Method', icon: 'payment' },
      ],
    },
    {
      title: 'General',
      items: [
        { label: 'Language', icon: 'language' },
        { label: 'Accessibility', icon: 'accessibility' },
        { label: 'Privacy Data', icon: 'safety' },
        { label: 'Notification', icon: 'notification' },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Report an issue', icon: 'error' },
        { label: 'Help & Support', icon: 'help' },
      ],
    },
  ];

  return (
    <Screen safeAreaBottom={false} style={styles.screen}>
      <Header
        title="Settings"
        leftIcon="back"
        rightIcon="notification"
        onRightPress={() => navigation.navigate('HelplineTab', { screen: 'Notifications' })}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <ProfileCardBg width="100%" height="100%" style={StyleSheet.absoluteFill} />
          <View style={styles.profileCardBody}>
            <Image
              source={careProfile?.avatarUrl ? { uri: careProfile.avatarUrl } : theme.images.onboarding1}
              style={styles.avatar}
            />
            <View style={styles.profileText}>
              <Text style={styles.profileName}>{name}</Text>
              <View style={styles.profileSubRow}>
                <Text style={styles.profileSubText}>{age !== null ? `${age} years old` : '—'}</Text>
                {careProfile?.gender?.name && (
                  <>
                    <Text style={[styles.profileSubText, styles.profileDot]}> · </Text>
                    <Text style={styles.profileSubText}>{careProfile.gender.name}</Text>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.sectionTitle}>Role</Text>
          <View style={styles.roleToggle}>
            <Pressable
              style={[styles.roleSegment, role === 'myself' && styles.roleSegmentActive]}
              onPress={() => setRole('myself')}
            >
              <Text style={[styles.roleLabel, role === 'myself' && styles.roleLabelActive]}>Myself</Text>
            </Pressable>
            <Pressable
              style={[styles.roleSegment, role === 'parent' && styles.roleSegmentActive]}
              onPress={() => setRole('parent')}
            >
              <Text style={[styles.roleLabel, role === 'parent' && styles.roleLabelActive]}>Parent</Text>
            </Pressable>
          </View>
        </View>

        {groups.map((group) => (
          <View key={group.title} style={styles.field}>
            <Text style={styles.sectionTitle}>{group.title}</Text>
            <View style={styles.rowList}>
              {group.items.map((item) => (
                <SettingsMenuItem
                  key={item.label}
                  label={item.label}
                  variant={item.variant}
                  icon={
                    <Icon
                      name={item.icon}
                      variant="outline"
                      size={ICON_SIZE}
                      color={
                        item.variant === 'danger'
                          ? theme.colors.status.error
                          : item.variant === 'safe'
                          ? theme.colors.primary
                          : theme.colors.tertiary
                      }
                    />
                  }
                  onPress={item.onPress}
                />
              ))}
            </View>
          </View>
        ))}

        <SettingsMenuItem
          label="Delete Account"
          variant="danger"
          icon={<Icon name="delete" variant="outline" size={ICON_SIZE} color={theme.colors.status.error} />}
          style={styles.fullWidthRow}
        />
        <SettingsMenuItem
          label="Log out"
          variant="safe"
          icon={<Icon name="signOut" variant="outline" size={ICON_SIZE} color={theme.colors.primary} />}
          style={styles.fullWidthRow}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
        />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
    paddingBottom: 120, // clear the floating bottom tab bar
    gap: theme.spacing.xxl,
  },
  profileCard: {
    height: 104,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
  },
  profileCardBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  profileText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  profileName: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(20),
    lineHeight: 30,
    color: '#FFFFFF',
  },
  profileSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileSubText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: '#FFFFFF',
  },
  profileDot: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.tertiary,
  },
  field: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h4.fontSize),
    color: theme.colors.neutral[500],
  },
  roleToggle: {
    flexDirection: 'row',
    height: 44,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.tertiary,
  },
  roleSegment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.sm,
  },
  roleSegmentActive: {
    backgroundColor: '#FFFFFF',
  },
  roleLabel: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: '#FFFFFF',
  },
  roleLabelActive: {
    color: theme.colors.tertiary,
  },
  rowList: {
    gap: theme.spacing.md,
  },
  fullWidthRow: {
    width: '100%',
  },
});

export default SettingsScreen;
