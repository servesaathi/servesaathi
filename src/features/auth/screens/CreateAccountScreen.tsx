import React, { useState } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { TextInput, PasswordInput } from '@/components/inputs';

import { responsiveFontSize } from '@/utils/responsive';
import { isValidName, isValidEmail, isValidPassword, MIN_PASSWORD_LENGTH } from '@/utils/validation';
import { authService, getErrorMessage } from '@/api';
import { useAuthStore } from '@/store/auth.store';
import { useUserStore } from '@/store/user.store';

type Touched = Partial<Record<'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword', boolean>>;

export const CreateAccountScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'CreateAccount'>>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState<Touched>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const markTouched = (field: keyof Touched) => setTouched((prev) => ({ ...prev, [field]: true }));

  const errors = {
    firstName: !isValidName(firstName) ? 'Enter a valid first name' : undefined,
    lastName: !isValidName(lastName) ? 'Enter a valid last name' : undefined,
    email: !isValidEmail(email) ? 'Enter a valid email address' : undefined,
    password: !isValidPassword(password)
      ? `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
      : undefined,
    confirmPassword: confirmPassword !== password || !confirmPassword
      ? 'Passwords do not match'
      : undefined,
  };
  const isFormValid = Object.values(errors).every((e) => !e);

  const handleCreateAccount = async () => {
    if (!isFormValid || submitting) return;
    const { phone, role, phoneVerificationToken } = useAuthStore.getState();
    setSubmitting(true);
    setApiError(null);
    try {
      // phoneVerificationToken comes from the OTP-verify step; the backend takes
      // phone/role from it and marks the phone verified.
      const { accessToken, user } = await authService.register({
        email,
        password,
        firstName,
        lastName,
        phone: phone ?? undefined,
        role,
        phoneVerificationToken: phoneVerificationToken ?? undefined,
      });
      useAuthStore.getState().setToken(accessToken);
      useUserStore.getState().setProfile({
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        phone: user.phone ?? phone ?? '',
        role: null,
        age: '',
      });
      navigation.navigate('Permission');
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
      <Header title="Create Account" leftIcon="back" transparent />

      <View style={styles.content}>
        <View style={styles.formSection}>
          <TextInput
            label="First name"
            placeholder="Enter recipient's name"
            value={firstName}
            onChangeText={setFirstName}
            onBlur={() => markTouched('firstName')}
            error={touched.firstName && firstName.length > 0 ? errors.firstName : undefined}
          />
          <TextInput
            label="Last name"
            placeholder="Enter recipient's last name"
            value={lastName}
            onChangeText={setLastName}
            onBlur={() => markTouched('lastName')}
            error={touched.lastName && lastName.length > 0 ? errors.lastName : undefined}
          />
          <TextInput
            label="Email address"
            placeholder="Enter Email address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            onBlur={() => markTouched('email')}
            error={touched.email && email.length > 0 ? errors.email : undefined}
          />
          <PasswordInput
            label="New Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            onBlur={() => markTouched('password')}
            error={touched.password && password.length > 0 ? errors.password : undefined}
          />
          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onBlur={() => markTouched('confirmPassword')}
            error={touched.confirmPassword && confirmPassword.length > 0 ? errors.confirmPassword : undefined}
          />

          <Text style={styles.terms}>
            By continuing, you agree to ServeSaathi's{' '}
            <Text style={styles.termsLink}>Terms &amp; Conditions</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          {apiError && <Text style={styles.apiError}>{apiError}</Text>}
          <PrimaryButton
            label="Create an account"
            onPress={handleCreateAccount}
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
    paddingTop: theme.spacing.xxxxl,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    justifyContent: 'space-between',
  },
  screenContent: {
    flexGrow: 1,
  },
  formSection: {
    gap: theme.spacing.md,
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingBottom: Platform.OS === 'ios' ? theme.spacing.hud : theme.spacing.xxl,
  },
  terms: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(theme.typography.caption.fontSize),
    lineHeight: theme.typography.caption.lineHeight,
    color: theme.colors.neutral[900],
  },
  termsLink: {
    color: theme.colors.primary,
  },
  apiError: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(theme.typography.caption.fontSize),
    color: theme.colors.status.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
});
