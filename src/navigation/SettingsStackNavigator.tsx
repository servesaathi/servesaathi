import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SettingsScreen } from '@/features/settings/screens/SettingsScreen';
import { EditProfileScreen } from '@/features/settings/screens/EditProfileScreen';

// Nested inside the Setting tab (not the root stack) so the bottom tab bar stays visible,
// matching the Figma frames — "Account Profile" (1432:39176) shows the Setting tab
// highlighted in its Bottom Nav Bar just like the Settings root does.
export type SettingsStackParamList = {
  SettingsHome: undefined;
  EditProfile: undefined;
};

const Stack = createStackNavigator<SettingsStackParamList>();

export const SettingsStackNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName="SettingsHome"
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: 'transparent' },
    }}
  >
    <Stack.Screen name="SettingsHome" component={SettingsScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
  </Stack.Navigator>
);
