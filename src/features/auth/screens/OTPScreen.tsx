import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootNavigationProp, RootRouteProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { OTPInput } from '@/components/inputs';
import { responsiveFontSize } from '@/utils/responsive';
import { authService, getErrorMessage } from '@/api';
import { useAuthStore } from '@/store/auth.store';

const OTP_LENGTH = 4;
const RESEND_SECONDS = 30;

// "+919777729450" → "+91-97****50"
const maskPhone = (phone: string) => {
  const match = phone.match(/^(\+\d{1,3})(\d{10})$/);
  if (!match) return phone;
  const digits = match[2];
  return `${match[1]}-${digits.slice(0, 2)}****${digits.slice(8)}`;
};

export const OTPScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'OTP'>>();
  const route = useRoute<RootRouteProp<'OTP'>>();
  const storedPhone = useAuthStore((s) => s.phone);
  const phone = route.params?.phone ?? storedPhone ?? '';

  const [otpValue, setOtpValue] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);

  const isOtpComplete = otpValue.length === OTP_LENGTH;

  useEffect(() => {
    if (resendIn === 0) return;
    const id = setTimeout(() => setResendIn(resendIn - 1), 1000);
    return () => clearTimeout(id);
  }, [resendIn]);

  const handleOtpChange = (value: string) => {
    setOtpValue(value);
    if (error) setError(null);
  };

  const handleContinue = async () => {
    if (!isOtpComplete || verifying) return;
    setVerifying(true);
    setError(null);
    try {
      const data = await authService.verifyOtp({ phone, code: otpValue });
      useAuthStore.getState().setPhoneVerification(data);
      // Figma flow: OTP Verification → Create Account form; existing users skip it
      navigation.navigate(data.isNewUser ? 'CreateAccount' : 'Home');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0 || resending) return;
    setResending(true);
    setError(null);
    setOtpValue('');
    setResendIn(RESEND_SECONDS);
    try {
      await authService.requestOtp({ phone, role: useAuthStore.getState().role });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <Screen statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content">
      <Header title="Create Account" leftIcon="back" transparent />

      <View style={styles.content}>
        <Spacer size="xxl" />

        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.subtitle}>
          The OTP has been sent to your verified mobile{' '}
          <Text style={styles.highlightMobile}>{maskPhone(phone)}</Text>
        </Text>

        <Spacer size="xxl" />

        <OTPInput
          length={OTP_LENGTH}
          value={otpValue}
          onChange={handleOtpChange}
          error={!!error}
        />

        {error && (
          <>
            <Spacer size="sm" />
            <Text style={styles.errorText}>{error}</Text>
          </>
        )}

        <Spacer size="xxl" />

        <PrimaryButton
          label="Continue"
          onPress={handleContinue}
          style={styles.button}
          disabled={!isOtpComplete}
          loading={verifying}
        />

        <Spacer size="lg" />

        {resendIn > 0 ? (
          <Text style={styles.resendText}>
            Didn't receive OTP?{' '}
            <Text style={styles.resendTimer}>
              Resend in 00:{String(resendIn).padStart(2, '0')}
            </Text>
          </Text>
        ) : (
          <Text style={styles.resendText}>
            Didn't receive OTP?{' '}
            <Text style={styles.resendLink} onPress={handleResend}>
              {resending ? 'Sending…' : 'Resend'}
            </Text>
          </Text>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxxxl,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(22),
    color: theme.colors.neutral[900],
  },
  subtitle: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(16),
    color: theme.colors.neutral[700],
    textAlign: 'center',
    lineHeight: 24,
  },
  highlightMobile: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.neutral[900],
  },
  button: {
    width: '100%',
  },
  errorText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(14),
    color: theme.colors.status.error,
    textAlign: 'center',
  },
  resendText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(15),
    color: theme.colors.neutral[700],
  },
  resendTimer: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.neutral[900],
  },
  resendLink: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.primary,
  },
});

export default OTPScreen;
