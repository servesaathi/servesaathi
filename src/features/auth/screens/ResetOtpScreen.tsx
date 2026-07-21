import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootNavigationProp, RootRouteProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { OTPInput } from '@/components/inputs';
import { responsiveFontSize } from '@/utils/responsive';
import { authService, getErrorMessage } from '@/api';

const OTP_LENGTH = 4;
const RESEND_SECONDS = 30;

// "+919777729450" → "+91-97****50"
const maskPhone = (phone: string) => {
  const match = phone.match(/^(\+\d{1,3})(\d{10})$/);
  if (!match) return phone;
  const digits = match[2];
  return `${match[1]}-${digits.slice(0, 2)}****${digits.slice(8)}`;
};

// "kamala.sharma@gmail.com" → "ka******@gmail.com"
const maskEmail = (email: string) => {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  const visible = name.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(name.length - 2, 3))}@${domain}`;
};

// "OPT Verification" (Figma 1257:23316 / 1257:24412) — reset-password OTP step. Unlike the
// login OTP screen, there's no /auth verify call here: the entered code becomes the `token`
// sent straight to /auth/reset-password on the next screen.
export const ResetOtpScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'ResetOtp'>>();
  const route = useRoute<RootRouteProp<'ResetOtp'>>();
  const { channel, contact } = route.params;
  const isEmail = channel === 'email';

  const [otpValue, setOtpValue] = useState('');
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

  const handleContinue = () => {
    if (!isOtpComplete) return;
    navigation.navigate('NewPassword', { token: otpValue });
  };

  const handleResend = async () => {
    if (resendIn > 0 || resending) return;
    setResending(true);
    setError(null);
    setOtpValue('');
    setResendIn(RESEND_SECONDS);
    try {
      if (isEmail) {
        await authService.forgotPassword({ email: contact });
      }
      // SMS channel has no backend support yet — nothing to resend.
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <Screen statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content">
      <Header leftIcon="back" transparent />

      <View style={styles.content}>
        <Spacer size="xxl" />

        <Text style={styles.title}>OTP code verification</Text>
        <Text style={styles.subtitle}>
          The OTP has been sent to your verified {isEmail ? 'email' : 'mobile'}{' '}
          <Text style={styles.highlight}>{isEmail ? maskEmail(contact) : maskPhone(contact)}</Text>
          . Enter the OTP code below to verify.
        </Text>

        <Spacer size="xxl" />

        <OTPInput length={OTP_LENGTH} value={otpValue} onChange={handleOtpChange} error={!!error} />

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
        />

        <Spacer size="lg" />

        {resendIn > 0 ? (
          <Text style={styles.resendText}>
            Didn't receive OTP?{' '}
            <Text style={styles.resendTimer}>Resend in 00:{String(resendIn).padStart(2, '0')}</Text>
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
  highlight: {
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

export default ResetOtpScreen;
