import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import SplashScreen from '@/features/auth/screens/SplashScreen';
import LanguageSelectScreen from '@/features/auth/screens/LanguageSelectScreen';
import OnboardingScreen from '@/features/auth/screens/OnboardingScreen';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { OTPScreen } from '@/features/auth/screens/OTPScreen';
import { EnterEmailScreen } from '@/features/auth/screens/EnterEmailScreen';
import { ForgotPasswordMethodScreen } from '@/features/auth/screens/ForgotPasswordMethodScreen';
import { ForgotPasswordContactScreen } from '@/features/auth/screens/ForgotPasswordContactScreen';
import { ResetOtpScreen } from '@/features/auth/screens/ResetOtpScreen';
import { NewPasswordScreen } from '@/features/auth/screens/NewPasswordScreen';
import { RoleSelectionScreen } from '@/features/auth/screens/RoleSelectionScreen';
import { CreateAccountScreen } from '@/features/auth/screens/CreateAccountScreen';
import { PermissionScreen } from '@/features/auth/screens/PermissionScreen';
import { ProfileSetupScreen } from '@/features/profileCreation/screens/ProfileSetupScreen';
import { AddressScreen } from '@/features/profileCreation/screens/AddressScreen';
import { HealthInfoScreen } from '@/features/profileCreation/screens/HealthInfoScreen';
import { InterestsScreen } from '@/features/profileCreation/screens/InterestsScreen';
import { CircleOfCareScreen } from '@/features/profileCreation/screens/CircleOfCareScreen';
import { AccessibilityScreen } from '@/features/profileCreation/screens/AccessibilityScreen';
import { SettingUpScreen } from '@/features/profileCreation/screens/SettingUpScreen';
import { SubscriptionScreen } from '@/features/payments/screens/SubscriptionScreen';
import { PaymentMethodScreen } from '@/features/payments/screens/PaymentMethodScreen';
import { BottomTabNavigator } from '@/navigation/BottomTabNavigator';
import { PersonalizedQuestionsScreen } from '@/features/services/screens/PersonalizedQuestionsScreen';
import { CaregiverListScreen } from '@/features/services/screens/CaregiverListScreen';
import { CaregiverDetailScreen } from '@/features/services/screens/CaregiverDetailScreen';
import { ComparisonScreen } from '@/features/services/screens/ComparisonScreen';
import { RequestSetupScreen } from '@/features/services/screens/RequestSetupScreen';
import { RequestDetailsScreen } from '@/features/services/screens/RequestDetailsScreen';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="EnterEmail" component={EnterEmailScreen} />
      <Stack.Screen name="ForgotPasswordMethod" component={ForgotPasswordMethodScreen} />
      <Stack.Screen name="ForgotPasswordContact" component={ForgotPasswordContactScreen} />
      <Stack.Screen name="ResetOtp" component={ResetOtpScreen} />
      <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
      <Stack.Screen name="Permission" component={PermissionScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="ProfileAddress" component={AddressScreen} />
      <Stack.Screen name="ProfileHealth" component={HealthInfoScreen} />
      <Stack.Screen name="ProfileInterests" component={InterestsScreen} />
      <Stack.Screen name="ProfileCircle" component={CircleOfCareScreen} />
      <Stack.Screen name="ProfileAccessibility" component={AccessibilityScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
      <Stack.Screen name="SettingUp" component={SettingUpScreen} />
      <Stack.Screen name="Home" component={BottomTabNavigator} />
      <Stack.Screen name="PersonalizedQuestions" component={PersonalizedQuestionsScreen} />
      <Stack.Screen name="CaregiverList" component={CaregiverListScreen} />
      <Stack.Screen name="CaregiverDetail" component={CaregiverDetailScreen} />
      <Stack.Screen name="Comparison" component={ComparisonScreen} />
      <Stack.Screen name="RequestSetup" component={RequestSetupScreen} />
      <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
