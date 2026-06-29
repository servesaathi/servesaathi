import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';

interface LoaderProps {
  message?: string;
  overlay?: boolean;
  style?: ViewStyle;
}

export const Loader: React.FC<LoaderProps> = ({ message, overlay = false, style }) => {
  const content = (
    <View style={[styles.center, style]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message && <Text style={styles.loaderText}>{message}</Text>}
    </View>
  );

  if (overlay) {
    return <View style={styles.overlay}>{content}</View>;
  }
  return content;
};

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loaderText: {
    marginTop: theme.spacing.md,
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: theme.colors.neutral[700],
  },
});
