import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors, useIsDarkMode } from '@/hooks/useThemeColors';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  statusBarBg?: string;
  statusBarStyle?: 'dark-content' | 'light-content';
  statusBarTranslucent?: boolean;
  safeAreaBottom?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  statusBarBg = 'transparent',
  statusBarStyle,
  statusBarTranslucent = true,
  safeAreaBottom = true,
}) => {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isDark = useIsDarkMode();
  // Callers that care already pass an explicit statusBarStyle (e.g. to match a
  // colored header); everyone else gets one that follows the OS theme instead
  // of always defaulting to dark-content, which is unreadable on a dark canvas.
  const effectiveStatusBarStyle = statusBarStyle ?? (isDark ? 'light-content' : 'dark-content');
  const backgroundStyle = { backgroundColor: colors.background.layout };
  const containerStyle = [
    styles.screenContainer,
    backgroundStyle,
    style,
    {
      paddingTop: statusBarTranslucent ? 0 : insets.top,
      paddingBottom: safeAreaBottom ? insets.bottom : 0,
    },
  ];

  return (
    <View style={styles.flex}>
      <StatusBar
        backgroundColor={statusBarBg}
        barStyle={effectiveStatusBarStyle}
        translucent={statusBarTranslucent}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        {scrollable ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={containerStyle}>{children}</View>
          </ScrollView>
        ) : (
          <View style={containerStyle}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screenContainer: { flex: 1 },
  scrollContent: { flexGrow: 1 },
});
