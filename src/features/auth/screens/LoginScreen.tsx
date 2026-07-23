import React, { useState } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { RootNavigationProp, RootRouteProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton, TertiaryButton } from '@/components/buttons';
import { TextInput } from '@/components/inputs';
import { scale, responsiveFontSize } from '@/utils/responsive';
import { useTranslation } from '@/utils/localization';
import { digitsOnly, isValidIndianMobile } from '@/utils/validation';
import { BrandLogoSVG } from '@/components/BrandLogoSVG';
import { authService, getErrorMessage } from '@/api';
import { useAuthStore } from '@/store/auth.store';

// Google Colored Vector Icon
const GoogleIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </Svg>
);

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'Login'>>();
  const route = useRoute<RootRouteProp<'Login'>>();
  const intent = route.params?.intent ?? 'signup';
  const isLogin = intent === 'login';
  const { t } = useTranslation();
  const [mobile, setMobile] = useState('');
  const [mobileTouched, setMobileTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | undefined>(undefined);

  const isMobileValid = isValidIndianMobile(mobile);
  // Show an error only once the user has left the field (or filled 10 digits) and it's invalid
  const mobileError =
    (mobileTouched || mobile.length === 10) && mobile.length > 0 && !isMobileValid
      ? 'Enter a valid 10-digit mobile number starting with 6–9'
      : undefined;

  const handleMobileChange = (value: string) => {
    // Digits only, hard-capped at 10 — blocks typing/pasting anything longer
    setMobile(digitsOnly(value).slice(0, 10));
    setApiError(undefined);
  };

  const handleContinue = async () => {
    if (!isMobileValid || submitting) return;
    const phone = `+91${mobile}`;
    const { role, setPhone } = useAuthStore.getState();
    setSubmitting(true);
    setApiError(undefined);
    try {
      await authService.requestOtp({ phone, role });
      setPhone(phone);
      navigation.navigate('OTP', { phone, intent });
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: no Google/OAuth endpoint exists on the backend yet — wire this up once
    // one is added (checked the live Swagger docs: only phone-OTP and email/password
    // auth are implemented server-side today).
  };

  const handleEmailLogin = () => {
    navigation.navigate('EnterEmail');
  };

  // Custom Country Code Prefix Selector component mimicking the design spec
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

  return (
    <Screen scrollable statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content">
      <Header leftIcon="back" transparent />

      <View style={styles.content}>
        {/* Mirrors Figma's "Enter mobile number Input" auto-layout frame (gap-24) */}
        <View style={styles.formGroup}>
          {/* Mirrors Figma's "Logo - Welcome" auto-layout frame (gap-16) */}
          <View style={styles.brandingGroup}>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <BrandLogoSVG width={240} height={64} />
          </View>

          <Text style={styles.subtitle}>
            {isLogin
              ? 'Log in to check on the seniors you care\n about and continue their journey with us.'
              : 'Create profiles for the seniors you care\n about and begin their journey with us.'}
          </Text>

          {/* INPUT FIELD */}
          <TextInput
            label="Mobile Number"
            placeholder="000-000-0000"
            keyboardType="number-pad"
            maxLength={10}
            value={mobile}
            onChangeText={handleMobileChange}
            onBlur={() => setMobileTouched(true)}
            error={mobileError ?? apiError}
            prefixIcon={<CountryCodePrefix />}
          />

          {/* CONTINUE BUTTON — stays disabled until the mobile number is valid */}
          <PrimaryButton
            label="Continue"
            onPress={handleContinue}
            disabled={!isMobileValid}
            loading={submitting}
          />
        </View>

        <Spacer size={64} />

        {/* OR divider + social buttons all sit on Figma's shared gap-16 */}
        <View style={styles.dividerGroup}>
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TertiaryButton
            label="Sign in with Google"
            onPress={handleGoogleLogin}
            prefixIcon={<GoogleIcon />}
            style={styles.socialButton}
            labelStyle={styles.socialButtonText}
          />
          <TertiaryButton
            label="Sign in with Email"
            onPress={handleEmailLogin}
            style={styles.socialButton}
            labelStyle={styles.socialButtonText}
          />
        </View>

        {/* <Spacer size="xl" /> */}

        {/* FOOTER SECTION */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            {isLogin ? (
              <>
                <Text style={styles.footerText}>Don't have an account yet? </Text>
                <Text style={styles.loginLink} onPress={() => navigation.navigate('RoleSelection')}>
                  Sign up
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.footerText}>Already have an account? </Text>
                <Text
                  style={styles.loginLink}
                  onPress={() => navigation.replace('Login', { intent: 'login' })}
                >
                  Log in
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1, // fill viewport so the auto margins below can distribute leftover space
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.hud, // 48 — extra breathing room between header and branding
    paddingBottom: Platform.OS === 'ios' ? 44 : 32, // Safe padding at the bottom of ScrollView
  },
  formGroup: {
    width: '100%',
    alignItems: 'center',
    gap: theme.spacing.xxl, // 24 — Figma "Enter mobile number Input" gap-24
    marginTop: theme.spacing.md,
  },
  brandingGroup: {
    alignItems: 'center',
    gap: theme.spacing.lg, // 16 — Figma "Logo - Welcome" gap-16
    paddingVertical: theme.spacing.sm,
  },
  welcomeText: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(22),
    color: theme.colors.primary,
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
  dividerGroup: {
    // Figma anchors OR + social buttons + footer to the bottom; the flexible space
    // lives between the Continue button and the OR divider (y=482 → y=544).
    marginTop: 'auto',
    width: '100%',
    alignItems: 'center',
    gap: theme.spacing.lg, // 16 — Figma: OR divider → Google → Email all share gap-16
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.tertiary, // Orange divider line
  },
  dividerText: {
    marginHorizontal: theme.spacing.md,
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(16),
    color: theme.colors.neutral[700],
  },
  socialButton: {
    backgroundColor: '#FFFFFF',
    borderColor: theme.colors.forestGreen[100], // G Line
    borderWidth: 1.5,
  },
  socialButtonText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(16),
    lineHeight: 22,
    color: theme.colors.neutral[900],
  },
  footer: {
    // Second auto margin: leftover screen height splits equally between the
    // Continue→OR gap and the Email→footer gap, spreading blocks down the screen.
    marginTop: 'auto',
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
    fontSize: responsiveFontSize(16),
    color: theme.colors.neutral[700],
  },
  loginLink: {
    fontFamily: theme.fonts.bold,
    fontSize: responsiveFontSize(16),
    color: theme.colors.primary,
  },
});

export default LoginScreen;
