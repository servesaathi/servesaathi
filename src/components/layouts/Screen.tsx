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
import { theme } from '@/theme';

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
  statusBarStyle = 'dark-content',
  statusBarTranslucent = true,
  safeAreaBottom = true,
}) => {
  const insets = useSafeAreaInsets();
  const backgroundStyle = { backgroundColor: theme.colors.background.layout };
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
        barStyle={statusBarStyle}
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
