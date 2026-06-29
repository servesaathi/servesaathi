import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Rect } from 'react-native-svg';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { responsiveFontSize, scale } from '@/utils/responsive';
import { useTranslation } from '@/utils/localization';

export const RoleSelectionScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'RoleSelection'>>();
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<string>('senior');

  const handleCreateAccount = () => {
    navigation.replace('Home');
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
                
                {isActive ? (
                  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <Rect width="24" height="24" rx="6" fill={theme.colors.tertiary} />
                    <Path
                      d="M8 12L11 15L16 9"
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                ) : (
                  <View style={styles.checkboxOutline} />
                )}
              </Pressable>
            );
          })}
        </View>

        <Spacer size="xxl" />

        <PrimaryButton
          label="Ready to create an account"
          onPress={handleCreateAccount}
          style={styles.actionBtn}
        />
        <Spacer size="xl" />
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
    fontSize: responsiveFontSize(24),
    color: theme.colors.neutral[900],
    fontWeight: 'bold',
  },
  subtitle: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(16),
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
  },
  activeCard: {
    borderColor: theme.colors.tertiary, // Orange 500
    backgroundColor: theme.colors.background.orange, // Orange 50
  },
  inactiveCard: {
    borderColor: theme.colors.neutral[200],
    backgroundColor: '#FFFFFF',
  },
  cardText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(16),
    color: theme.colors.neutral[900],
    fontWeight: '500',
  },
  checkboxOutline: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: theme.colors.tertiary,
    backgroundColor: '#FFFFFF',
  },
  actionBtn: {
    width: '100%',
  },
});
