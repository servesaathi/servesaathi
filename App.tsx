import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import RootNavigator from './src/navigation/RootNavigator';

SplashScreen.setOptions({
  duration: 0,
  fade: false,
});

// Hold the native splash until the JS splash screen has mounted, so the
// custom launch experience appears without the green Expo fallback lingering.
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
