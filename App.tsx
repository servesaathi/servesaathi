import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import RootNavigator from './src/navigation/RootNavigator';
import { clearFavoritesOnSessionChange } from './src/features/services/hooks/useFavorites';
import { installTextAccessibility } from './src/utils/textAccessibility';

// Swap react-native's Text/TextInput for accessibility-aware wrappers before
// anything renders, so the user's font-size and contrast settings apply app-wide.
installTextAccessibility();

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

// Logout or a different account signing in: drop the previous account's favourites.
clearFavoritesOnSessionChange(queryClient);

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
