import React, { useState } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { TextInput, PasswordInput } from '@/components/inputs';
import { responsiveFontSize } from '@/utils/responsive';
import { isValidEmail } from '@/utils/validation';
import { BrandLogoSVG } from '@/components/BrandLogoSVG';
import { authService, getErrorMessage } from '@/api';
import { useAuthStore } from '@/store/auth.store';
import { useUserStore } from '@/store/user.store';

// "Enter Email" (Figma 1248:47008 / 1248:47021) — email/password login for existing users.
export const EnterEmailScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'EnterEmail'>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | undefined>(undefined);

  const isEmailValid = isValidEmail(email);
  const emailError =
    emailTouched && email.length > 0 && !isEmailValid ? 'Enter a valid email address' : undefined;
  const isFormValid = isEmailValid && password.length > 0;

  const handleContinue = async () => {
    if (!isFormValid || submitting) return;
    setSubmitting(true);
    setApiError(undefined);
    try {
      const { accessToken, user } = await authService.login({ email, password });
      useAuthStore.getState().setToken(accessToken);
      useUserStore.getState().setProfile({
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        phone: user.phone ?? '',
        role: null,
        age: '',
      });
      navigation.navigate('Home');
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scrollable statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content">
      <Header title="Log in" leftIcon="back" transparent />

      <View style={styles.content}>
        <View style={styles.branding}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <BrandLogoSVG width={240} height={64} style={styles.logoSvg} />
        </View>

        <Spacer size={48} />

        <TextInput
          label="Email"
          placeholder="Enter email address"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            setApiError(undefined);
          }}
          onBlur={() => setEmailTouched(true)}
          error={emailError ?? apiError}
        />

        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            setApiError(undefined);
          }}
        />

        <Spacer size={24} />

        <PrimaryButton
          label="Continue"
          onPress={handleContinue}
          disabled={!isFormValid}
          loading={submitting}
        />

        <Spacer size="lg" />

        <Text style={styles.forgotLink} onPress={() => navigation.navigate('ForgotPasswordMethod')}>
          Forget Password?
        </Text>

        <Spacer size={64} />

        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account yet? </Text>
            <Text style={styles.signupLink} onPress={() => navigation.navigate('RoleSelection')}>
              Sign up
            </Text>
          </View>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
  },
  branding: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  welcomeText: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
    color: theme.colors.primary,
  },
  logoSvg: {
    marginTop: theme.spacing.sm,
  },
  forgotLink: {
    fontFamily: theme.fonts.semiBold,
    fontSize: responsiveFontSize(16),
    color: theme.colors.primary,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(14),
    color: theme.colors.neutral[700],
  },
  signupLink: {
    fontFamily: theme.fonts.bold,
    fontSize: responsiveFontSize(14),
    color: theme.colors.primary,
  },
});

export default EnterEmailScreen;
