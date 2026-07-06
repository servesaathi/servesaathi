import React, { useState } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { TextInput, PasswordInput } from '@/components/inputs';
import { responsiveFontSize } from '@/utils/responsive';

export const CreateAccountScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'CreateAccount'>>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleCreateAccount = () => {
    navigation.navigate('Permission');
  };

  return (
    <Screen scrollable statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content">
      <Header title="Create Account" leftIcon="back" transparent />

      <View style={styles.content}>
        <TextInput
          label="First name"
          placeholder="Enter recipient's name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          label="Last name"
          placeholder="Enter recipient's last name"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          label="Email address"
          placeholder="Enter Email address"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <PasswordInput
          label="New Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
        />
        <PasswordInput
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Text style={styles.terms}>
          By continuing, you agree to ServeSaathi's{' '}
          <Text style={styles.termsLink}>Terms &amp; Conditions</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>.
        </Text>

        <Spacer size="xl" />

        <PrimaryButton label="Create an account" onPress={handleCreateAccount} />
        <Spacer size="xl" />
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
  terms: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(theme.typography.caption.fontSize),
    lineHeight: theme.typography.caption.lineHeight,
    color: theme.colors.neutral[900],
  },
  termsLink: {
    color: theme.colors.primary,
  },
});
