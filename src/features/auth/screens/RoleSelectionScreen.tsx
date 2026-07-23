import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import RoleIllustrator from '../../../../assets/illustrations/role.svg';
import { Screen, Header } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { Checkbox } from '@/components/inputs';
import { responsiveFontSize, scale } from '@/utils/responsive';
import { useAuthStore } from '@/store/auth.store';
import { ApiRole } from '@/api/types';

// Maps the Figma role cards onto the roles the API understands.
const API_ROLE_BY_ID: Record<string, ApiRole> = {
  senior: 'customer',
  family: 'family',
  saathi: 'provider',
  partner: 'partner',
};

export const RoleSelectionScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'RoleSelection'>>();
  const [selectedRole, setSelectedRole] = useState<string>('senior');
  const setRole = useAuthStore((s) => s.setRole);

  const handleCreateAccount = () => {
    setRole(API_ROLE_BY_ID[selectedRole] ?? 'customer');
    // Figma flow: Join (Choose a role) → Mobile Phone Verify → OTP → Create Account
    navigation.navigate('Login', { intent: 'signup' });
  };

  const roles = [
    { id: 'senior', label: 'Senior' },
    { id: 'family', label: 'Family' },
    { id: 'saathi', label: 'Saathi' },
    { id: 'partner', label: 'Partner' },
  ];

  return (
    <Screen statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content" scrollable>
      <Header transparent />

      <View style={styles.content}>
        {/* Mirrors Figma's "Center Body" auto-layout frame (gap-24) */}
        <View style={styles.centerBody}>
          <View style={styles.graphicContainer}>
            <RoleIllustrator width={scale(279)} height={scale(159)} />
          </View>

          {/* Mirrors Figma's "Text" auto-layout frame (gap-16) */}
          <View style={styles.textBlock}>
            <Text style={styles.title}>Choose a role</Text>
            <Text style={styles.subtitle}>
              Choose How You Want to Be Part of the ServeSaathi Community
            </Text>
          </View>

          <View style={styles.cardsContainer}>
            {roles.map((role) => {
              const isActive = selectedRole === role.id;
              return (
                <Pressable
                  key={role.id}
                  onPress={() => setSelectedRole(role.id)}
                  style={[
                    styles.card,
                    isActive ? styles.activeCard : styles.inactiveCard,
                  ]}
                >
                  <Text style={styles.cardText}>{role.label}</Text>

                  <Checkbox
                    checked={isActive}
                    onPress={() => setSelectedRole(role.id)}
                    color="orange"
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Pinned to the bottom like the Figma frame (button at y=720/800) */}
        <View style={styles.footer}>
          <PrimaryButton
            label="Ready to create an account"
            onPress={handleCreateAccount}
            style={styles.actionBtn}
          />
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xxl, // 24 — matches Figma's "Language" frame px-24
    paddingTop: 100, // 32 — gap from header to illustration (was a negative pull-up hack)
    paddingBottom: theme.spacing.xxl, // 24 — screen bottom padding, stacks with Screen's own insets.bottom
    alignItems: 'center',
  },
  centerBody: {
    width: '100%',
    alignItems: 'center',
    gap: theme.spacing.xxl, // 24 — Figma "Center Body" gap-24 (illustration → text → cards)
  },
  graphicContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    alignItems: 'center',
    gap: theme.spacing.lg, // 16 — Figma "Text" gap-16 (title → subtitle)
  },
  title: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
    color: theme.colors.neutral[900],
  },
  subtitle: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[700],
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: theme.spacing.xxxl,
  },
  cardsContainer: {
    width: '100%',
    gap: 16,
  },
  card: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.radius.control,
    borderWidth: 1.5,
  },
  activeCard: {
    borderColor: theme.colors.tertiary, // Orange 500
    backgroundColor: theme.colors.background.orange, // Orange 50
  },
  inactiveCard: {
    borderColor: theme.colors.forestGreen[100], // G Line
    backgroundColor: '#FFFFFF',
  },
  cardText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(16),
    color: theme.colors.neutral[700],
  },
  actionBtn: {
    width: '100%',
  },
  footer: {
    marginTop: 'auto',
    width: '100%',
    paddingTop: theme.spacing.xxl,
  },
});
