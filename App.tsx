import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import RootNavigator from './src/navigation/RootNavigator';

// Hold the native splash until the JS splash screen is fully rendered
// (fonts + background image decoded), so there is a single atomic hand-off
// instead of layers popping in one after another.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* already hidden (e.g. fast refresh) — safe to ignore */
});

// Create TanStack Query client for API data fetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
