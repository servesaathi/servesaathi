import React, { useState } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton, TertiaryButton } from '@/components/buttons';
import { TextInput } from '@/components/inputs';
import { scale, responsiveFontSize } from '@/utils/responsive';
import { useTranslation } from '@/utils/localization';
import { BrandLogoSVG } from '@/components/BrandLogoSVG';

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
  const { t } = useTranslation();
  const [mobile, setMobile] = useState('');

  const handleContinue = () => {
    navigation.navigate('OTP');
  };

  const handleGoogleLogin = () => {
    // Add logic later
  };

  const handleEmailLogin = () => {
    // Add logic later
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
        {/* BRANDING SECTION */}
        <View style={styles.branding}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <BrandLogoSVG
            width={200}
            height={200 * (64 / 240)}
            style={styles.logoSvg}
          />
          <Spacer size="md" />
          <Text style={styles.subtitle}>
            Create profiles for the seniors you care about and begin their journey with us.
          </Text>
        </View>

        <Spacer size={48} />

        {/* INPUT FIELD */}
        <TextInput
          label="Mobile Number"
          placeholder="000-000-0000"
          keyboardType="phone-pad"
          value={mobile}
          onChangeText={setMobile}
          prefixIcon={<CountryCodePrefix />}
        />

        <Spacer size={24} />

        {/* CONTINUE BUTTON */}
        <PrimaryButton label="Continue" onPress={handleContinue} />

        <Spacer size={64} />

        {/* OR DIVIDER */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <Spacer size={48} />

        {/* SOCIAL SIGN IN BUTTONS */}
        <TertiaryButton
          label="Sign in with Google"
          onPress={handleGoogleLogin}
          prefixIcon={<GoogleIcon />}
          style={styles.socialButton}
          labelStyle={styles.socialButtonText}
        />
        <Spacer size="md" />
        <TertiaryButton
          label="Sign in with Email"
          onPress={handleEmailLogin}
          style={styles.socialButton}
          labelStyle={styles.socialButtonText}
        />

        <Spacer size={64} />

        {/* FOOTER SECTION */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Text style={styles.loginLink} onPress={() => {}}>
              Log in
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
    paddingBottom: Platform.OS === 'ios' ? 44 : 32, // Safe padding at the bottom of ScrollView
  },
  branding: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  welcomeText: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(20),
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  logoSvg: {
    marginTop: theme.spacing.sm,
  },
  subtitle: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(14),
    color: theme.colors.neutral[700],
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: theme.spacing.sm,
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
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 6,
  },
  countryCodeDivider: {
    width: 1.5,
    height: 24,
    backgroundColor: theme.colors.border.default,
    position: 'absolute',
    right: 0,
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
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(14),
    color: theme.colors.neutral[700],
    fontWeight: '600',
  },
  socialButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D2D1D1', // Matching design spec outlined border
    borderWidth: 1.5,
  },
  socialButtonText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontWeight: '400',
    fontSize: responsiveFontSize(16),
    lineHeight: 24,
    color: theme.colors.neutral[900],
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
  loginLink: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(14),
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
