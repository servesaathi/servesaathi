import React, { useState } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { RootNavigationProp, RootRouteProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { TextInput } from '@/components/inputs';
import { responsiveFontSize } from '@/utils/responsive';
import { digitsOnly, isValidIndianMobile, isValidEmail } from '@/utils/validation';
import { authService, getErrorMessage } from '@/api';

// "Enter Mobile Phone" / "Enter Email" (Figma 1257:24191 / 1257:24311) — reset-password contact
// step. One screen parameterized by channel since the two frames are otherwise identical.
export const ForgotPasswordContactScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'ForgotPasswordContact'>>();
  const route = useRoute<RootRouteProp<'ForgotPasswordContact'>>();
  const { channel } = route.params;
  const isEmail = channel === 'email';

  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | undefined>(undefined);
  const [smsUnavailable, setSmsUnavailable] = useState(false);

  const isMobileValid = isValidIndianMobile(mobile);
  const isEmailValid = isValidEmail(email);
  const isValid = isEmail ? isEmailValid : isMobileValid;
  const mobileError =
    touched && mobile.length > 0 && !isMobileValid
      ? 'Enter a valid 10-digit mobile number starting with 6–9'
      : undefined;
  const emailError =
    touched && email.length > 0 && !isEmailValid ? 'Enter a valid email address' : undefined;

  const CountryCodePrefix = () => (
    <View style={styles.countryCodeContainer}>
      <Text style={styles.countryCodeText}>(+91)</Text>
      <Svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={styles.chevron}>
        <Path
          d="M1 1L5 5L9 1"
          stroke={theme.colors.neutral[700]}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <View style={styles.countryCodeDivider} />
    </View>
  );

  const handleContinue = async () => {
    if (!isValid || submitting) return;

    if (!isEmail) {
      // No phone/SMS variant on /auth/forgot-password yet — visible per Figma, not wired.
      setSmsUnavailable(true);
      return;
    }

    setSubmitting(true);
    setApiError(undefined);
    try {
      await authService.forgotPassword({ email });
      navigation.navigate('ResetOtp', { channel, contact: email });
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scrollable statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content">
      <Header leftIcon="back" showLogo transparent />

      <View style={styles.content}>
        <Spacer size="xxl" />
        <Text style={styles.title}>Reset your Password</Text>
        <Spacer size="lg" />
        <Text style={styles.subtitle}>
          {isEmail
            ? 'Please enter your email address and we will send an OTP code in the next step to reset your password.'
            : 'Please enter your mobile phone number and we will send an OTP code in the next step to reset your password.'}
        </Text>
        <Spacer size="xl" />

        {isEmail ? (
          <TextInput
            label="Email address"
            placeholder="Enter your email address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              setApiError(undefined);
            }}
            onBlur={() => setTouched(true)}
            error={emailError ?? apiError}
          />
        ) : (
          <TextInput
            label="Mobile Number"
            placeholder="000-000-0000"
            keyboardType="number-pad"
            maxLength={10}
            value={mobile}
            onChangeText={(v) => setMobile(digitsOnly(v).slice(0, 10))}
            onBlur={() => setTouched(true)}
            error={mobileError}
            prefixIcon={<CountryCodePrefix />}
          />
        )}

        {smsUnavailable && (
          <Text style={styles.stubNotice}>
            Resetting via SMS isn't available yet — please use email instead.
          </Text>
        )}

        <Spacer size={64} />

        <PrimaryButton
          label="Continue"
          onPress={handleContinue}
          disabled={!isValid}
          loading={submitting}
        />

        <Spacer size="xl" />

        <Text style={styles.supportText}>
          Don't remember your {isEmail ? 'email address' : 'phone number'}?{'\n'}
          Contact us at <Text style={styles.supportLink}>hello@servesaathi.com</Text>
        </Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
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
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingRight: theme.spacing.md,
  },
  countryCodeText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(16),
    color: theme.colors.neutral[900],
  },
  chevron: {
    marginLeft: 6,
  },
  countryCodeDivider: {
    width: 1.5,
    height: 24,
    backgroundColor: theme.colors.forestGreen[100],
    position: 'absolute',
    right: 0,
  },
  stubNotice: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(14),
    color: theme.colors.status.error,
  },
  supportText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(14),
    color: theme.colors.neutral[700],
    textAlign: 'center',
    lineHeight: 20,
  },
  supportLink: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.primary,
  },
});

export default ForgotPasswordContactScreen;
