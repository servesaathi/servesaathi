import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HelplineHomeScreen } from '@/features/emergency/screens/HelplineHomeScreen';
import { HelplineListScreen } from '@/features/emergency/screens/HelplineListScreen';
import { ShareLocationScreen } from '@/features/emergency/screens/ShareLocationScreen';
import { EMResponderScreen } from '@/features/emergency/screens/EMResponderScreen';
import { NotificationsScreen } from '@/features/notifications/screens/NotificationsScreen';

// Nested inside the Helpline tab (not the root stack) so the bottom tab bar stays
// visible on these screens, matching the Figma frames (1376:16867 / 1372:8432 /
// 1376:17625 / 1445:12601 all include "Bottom Nav Bar"). Support Chat is the
// exception — its Figma frames only show a gesture bar, so it stays a full-screen
// root push (see RootNavigator).
export type HelplineStackParamList = {
  HelplineHome: undefined;
  HelplineList: undefined;
  ShareLocation: undefined;
  EMResponder: undefined;
  Notifications: undefined;
};

const Stack = createStackNavigator<HelplineStackParamList>();

export const HelplineStackNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName="HelplineHome"
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: 'transparent' },
    }}
  >
    <Stack.Screen name="HelplineHome" component={HelplineHomeScreen} />
    <Stack.Screen name="HelplineList" component={HelplineListScreen} />
    <Stack.Screen name="ShareLocation" component={ShareLocationScreen} />
    <Stack.Screen name="EMResponder" component={EMResponderScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);
