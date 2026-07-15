import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { Checkbox } from '@/components/inputs';
import { responsiveFontSize, scale } from '@/utils/responsive';

export const RoleSelectionScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'RoleSelection'>>();
  const [selectedRole, setSelectedRole] = useState<string>('senior');

  const handleCreateAccount = () => {
    // Figma flow: Join (Choose a role) → Mobile Phone Verify → OTP → Create Account
    navigation.navigate('Login');
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

      <View style={styles.graphicContainer}>
        <Image
          source={theme.images.cloudBlob}
          style={styles.cloudBlob}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <Spacer size="md" />
        
        <Text style={styles.title}>Choose a role</Text>
        <Spacer size="sm" />
        <Text style={styles.subtitle}>
          Choose How You Want to Be Part of the ServeSaathi Community
        </Text>

        <Spacer size="xl" />

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

        {/* Pinned to the bottom like the Figma frame (button at y=720/800) */}
        <View style={styles.footer}>
          <PrimaryButton
            label="Ready to create an account"
            onPress={handleCreateAccount}
            style={styles.actionBtn}
          />
        </View>
        <Spacer size="sm" />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  graphicContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -theme.spacing.lg, // Pull up under header
  },
  cloudBlob: {
    width: scale(300),
    height: scale(200),
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
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
    paddingHorizontal: theme.spacing.md,
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
    borderRadius: 6, // per design spec (theme.radius.sm is 8, doesn't match)
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
