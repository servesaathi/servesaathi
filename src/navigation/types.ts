import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  LanguageSelect: undefined;
  Onboarding: undefined;
  Login: { intent?: 'signup' | 'login' } | undefined;
  OTP: { phone: string; intent?: 'signup' | 'login' };
  EnterEmail: undefined;
  ForgotPasswordMethod: undefined;
  ForgotPasswordContact: { channel: 'sms' | 'email' };
  ResetOtp: { channel: 'sms' | 'email'; contact: string };
  NewPassword: { token: string };
  RoleSelection: undefined;
  CreateAccount: undefined;
  Permission: undefined;
  ProfileSetup: undefined;
  ProfileAddress: undefined;
  ProfileHealth: undefined;
  ProfileInterests: undefined;
  ProfileCircle: undefined;
  ProfileAccessibility: undefined;
  Subscription: undefined;
  PaymentMethod: undefined;
  SettingUp: undefined;
  Home: undefined;
  PersonalizedQuestions: { serviceType: string };
  CaregiverList: { serviceType: string };
  CaregiverDetail: { orgId: string };
  Comparison: { orgIds: string[] };
  RequestSetup: { orgId: string };
  RequestDetails: undefined;
};

export type RootNavigationProp<RouteName extends keyof RootStackParamList> = StackNavigationProp<
  RootStackParamList,
  RouteName
>;

export type RootRouteProp<RouteName extends keyof RootStackParamList> = RouteProp<
  RootStackParamList,
  RouteName
>;
