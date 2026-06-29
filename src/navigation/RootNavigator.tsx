import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import SplashScreen from '@/features/auth/screens/SplashScreen';
import LanguageSelectScreen from '@/features/auth/screens/LanguageSelectScreen';
import OnboardingScreen from '@/features/auth/screens/OnboardingScreen';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { OTPScreen } from '@/features/auth/screens/OTPScreen';
import { RoleSelectionScreen } from '@/features/auth/screens/RoleSelectionScreen';
import ShowcaseScreen from '@/features/showcase/screens/ShowcaseScreen';
import { BottomTabNavigator } from '@/navigation/BottomTabNavigator';

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
      <Stack.Screen name="Showcase" component={ShowcaseScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="Home" component={BottomTabNavigator} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
