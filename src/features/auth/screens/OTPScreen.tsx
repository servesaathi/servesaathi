import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { OTPInput } from '@/components/inputs';
import { responsiveFontSize } from '@/utils/responsive';

export const OTPScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'OTP'>>();
  const [otpValue, setOtpValue] = useState('');

  const handleContinue = () => {
    navigation.navigate('RoleSelection');
  };

  return (
    <Screen statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content">
      <Header title="Create Account" leftIcon="back" transparent />

      <View style={styles.content}>
        <Spacer size="xl" />

        <Text style={styles.title}>Enter verification code</Text>
        <Spacer size="sm" />
        <Text style={styles.subtitle}>
          The OPT has been sent to your verified mobile{' '}
          <Text style={styles.highlightMobile}>+91-98****02</Text>
        </Text>

        <Spacer size="xl" />
        <Spacer size="md" />

        <OTPInput
          length={4}
          value={otpValue}
          onChange={setOtpValue}
        />

        <Spacer size="xl" />
        <Spacer size="md" />

        <PrimaryButton label="Continue" onPress={handleContinue} style={styles.button} />

        <Spacer size="xl" />

        <Text style={styles.resendText}>
          Didn't receive OPT? <Text style={styles.resendTimer}>Resend in 00:28</Text>
        </Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(22),
    color: theme.colors.neutral[900],
    fontWeight: 'bold',
  },
  subtitle: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(16),
    color: theme.colors.neutral[700],
    textAlign: 'center',
    lineHeight: 24,
  },
  highlightMobile: {
    fontWeight: 'bold',
    color: theme.colors.neutral[900],
  },
  button: {
    width: '100%',
  },
  resendText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(15),
    color: theme.colors.neutral[700],
  },
  resendTimer: {
    fontWeight: 'bold',
    color: theme.colors.neutral[900], // Adjust color if specific design needed
  },
});
