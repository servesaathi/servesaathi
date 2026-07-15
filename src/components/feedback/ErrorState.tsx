import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry, style }) => {
  return (
    <View style={[styles.center, styles.errorContainer, style]}>
      <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill={theme.colors.status.errorBg} />
        <Path
          d="M12 8V12M12 16H12.01"
          stroke={theme.colors.status.error}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </Svg>
      <Text style={styles.titleText}>Something went wrong</Text>
      <Text style={styles.subText}>{message}</Text>
      {onRetry && (
        <PrimaryButton size="small" label="Try Again" onPress={onRetry} style={styles.retryBtn} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  errorContainer: {
    backgroundColor: theme.colors.background.base,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  titleText: {
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h4.fontSize),
    color: theme.colors.neutral[900],
    marginTop: theme.spacing.md,
  },
  subText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: theme.colors.neutral[700],
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  retryBtn: { marginTop: theme.spacing.md },
});
