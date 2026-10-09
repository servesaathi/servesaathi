import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, NavigatorScreenParams } from '@react-navigation/native';
import type { BottomTabParamList } from './BottomTabNavigator';

/** What the user picked on RequestSetupScreen — carried forward so RequestDetailsScreen
 *  can show the real selection (and "Edit" can send them back to change it). */
export interface RequestFormValues {
  method: string;
  /** "2026-04-15" — see toDateISO/parseDateISO in features/services/utils/scheduleDate.ts. */
  dateISO: string;
  time: string;
  notes: string;
  reminder: boolean;
}

export type RootStackParamList = {
  Splash: undefined;
  LanguageSelect: undefined;
  Onboarding: { startAtEnd?: boolean } | undefined;
  Login: { intent?: 'signup' | 'login' } | undefined;
  OTP: { phone: string; intent?: 'signup' | 'login' };
  EnterEmail: undefined;
  ForgotPasswordMethod: undefined;
  ForgotPasswordContact: { channel: 'sms' | 'email' };
  ResetOtp: { channel: 'sms' | 'email'; contact: string };
  NewPassword: { token: string };
  RoleSelection: undefined;
  CreateAccount: undefined;
  /** Guest browsing entry — Onboarding "Get Started" lands here (no account). */
  GuestBrowse: undefined;
  Permission: undefined;
  ProfileSetup: undefined;
  ProfileAddress: undefined;
  ProfileHealth: undefined;
  ProfileInterests: undefined;
  ProfileCircle: undefined;
  ProfileAccessibility: { fromSettings?: boolean } | undefined;
  Subscription: undefined;
  PaymentMethod: undefined;
  SettingUp: undefined;
  Home: NavigatorScreenParams<BottomTabParamList> | undefined;
  PersonalizedQuestions: { serviceType: string };
  /** categoryId narrows the list to one backend category (GET /providers?categoryId=). */
  CaregiverList: { serviceType: string; categoryId?: number };
  CaregiverDetail: { orgId: string; serviceType?: string };
  Comparison: { orgIds: string[] };
  /** Guest-facing comparison — the lower rows are gated behind phone verification. */
  GuestComparison: { orgIds: string[]; serviceType?: string };
  RequestSetup: { orgId: string; isBooking?: boolean };
  RequestDetails: { orgId?: string; isBooking?: boolean; requestValues?: RequestFormValues } | undefined;
  BookDetails: { orgId: string };
  HelplineList: undefined;
  ShareLocation: undefined;
  EMResponder: undefined;
  SupportChat: undefined;
  Notifications: undefined;
  EditProfile: undefined;
  /** Elder Wellbeing Score — `start` opens the set-up pop-up on arrival. */
  EwsHome: { start?: boolean } | undefined;
  EwsCheckIn: undefined;
  EwsPlan: undefined;
  EwsExplore: undefined;
};

export type RootNavigationProp<RouteName extends keyof RootStackParamList> = StackNavigationProp<
  RootStackParamList,
  RouteName
>;

export type RootRouteProp<RouteName extends keyof RootStackParamList> = RouteProp<
  RootStackParamList,
  RouteName
>;
