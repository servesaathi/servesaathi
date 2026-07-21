import React, { useState } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootNavigationProp, RootRouteProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { PasswordInput } from '@/components/inputs';
import { responsiveFontSize } from '@/utils/responsive';
import { isValidPassword, MIN_PASSWORD_LENGTH } from '@/utils/validation';
import { authService, getErrorMessage } from '@/api';

// "New Password" (Figma 1257:24462) — final reset-password step. `token` is the OTP code
// collected on the previous screen; there's no separate verify call, it's sent together
// with the new password to /auth/reset-password.
export const NewPasswordScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'NewPassword'>>();
  const route = useRoute<RootRouteProp<'NewPassword'>>();
  const { token } = route.params;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState<{ password?: boolean; confirmPassword?: boolean }>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | undefined>(undefined);

  const passwordError = !isValidPassword(password)
    ? `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    : undefined;
  const confirmError =
    confirmPassword !== password || !confirmPassword ? 'Passwords do not match' : undefined;
  const isFormValid = !passwordError && !confirmError;

  const handleReset = async () => {
    if (!isFormValid || submitting) return;
    setSubmitting(true);
    setApiError(undefined);
    try {
      await authService.resetPassword({ token, newPassword: password });
      navigation.navigate('Login', { intent: 'login' });
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen
      scrollable
      statusBarBg={theme.colors.background.layout}
      statusBarStyle="dark-content"
      contentContainerStyle={styles.screenContent}
    >
      <Header leftIcon="back" showLogo transparent />

      <View style={styles.content}>
        <View style={styles.formSection}>
          <Spacer size="xl" />
          <Text style={styles.title}>Create new password</Text>
          <Spacer size="lg" />
          <Text style={styles.subtitle}>
            Enter your new password below to complete the reset process.
          </Text>
          <Spacer size="xl" />

          <PasswordInput
            label="New Password"
            placeholder="Enter new password"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              setApiError(undefined);
            }}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            error={touched.password && password.length > 0 ? passwordError : undefined}
          />
          <PasswordInput
            label="Confirm new Password"
            placeholder="Enter new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
            error={
              touched.confirmPassword && confirmPassword.length > 0 ? confirmError : undefined
            }
          />
          {apiError && <Text style={styles.apiError}>{apiError}</Text>}
        </View>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            label="Reset password"
            onPress={handleReset}
            disabled={!isFormValid}
            loading={submitting}
          />
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    justifyContent: 'space-between',
  },
  screenContent: {
    flexGrow: 1,
  },
  formSection: {
    gap: theme.spacing.md,
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
  apiError: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(14),
    color: theme.colors.status.error,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingBottom: Platform.OS === 'ios' ? theme.spacing.hud : theme.spacing.xxl,
  },
});

export default NewPasswordScreen;
