import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { Checkbox } from '@/components/inputs';
import { responsiveFontSize } from '@/utils/responsive';

type Channel = 'sms' | 'email';

// "Enter Email" / Reset method select (Figma 1257:23864) — choose how to receive the reset code.
export const ForgotPasswordMethodScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'ForgotPasswordMethod'>>();
  const [channel, setChannel] = useState<Channel>('email');

  const options: { id: Channel; label: string }[] = [
    { id: 'sms', label: 'Send via SMS' },
    { id: 'email', label: 'Send via Email' },
  ];

  const handleContinue = () => {
    navigation.navigate('ForgotPasswordContact', { channel });
  };

  return (
    <Screen statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content">
      <Header leftIcon="back" showLogo transparent />

      <View style={styles.content}>
        <Spacer size="xxl" />
        <Text style={styles.title}>Reset your Password</Text>
        <Spacer size="lg" />
        <Text style={styles.subtitle}>
          Please select the following options to reset your password.
        </Text>
        <Spacer size="xl" />

        <View style={styles.optionsContainer}>
          {options.map((option) => {
            const isActive = channel === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => setChannel(option.id)}
                style={[styles.card, isActive ? styles.activeCard : styles.inactiveCard]}
              >
                <Text style={styles.cardText}>{option.label}</Text>
                <Checkbox checked={isActive} onPress={() => setChannel(option.id)} color="orange" />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <PrimaryButton label="Continue" onPress={handleContinue} />
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  title: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
    color: theme.colors.neutral[900],
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[700],
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    gap: theme.spacing.md,
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
    borderColor: theme.colors.tertiary,
    backgroundColor: theme.colors.background.orange,
  },
  inactiveCard: {
    borderColor: theme.colors.forestGreen[100],
    backgroundColor: '#FFFFFF',
  },
  cardText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(16),
    color: theme.colors.neutral[700],
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: Platform.OS === 'ios' ? theme.spacing.hud : theme.spacing.xxl,
  },
});

export default ForgotPasswordMethodScreen;
