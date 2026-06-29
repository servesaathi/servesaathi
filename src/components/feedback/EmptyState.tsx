import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';

interface EmptyStateProps {
  message: string;
  description?: string;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, description, style }) => {
  return (
    <View style={[styles.center, styles.emptyContainer, style]}>
      <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill={theme.colors.forestGreen[50]} />
        <Path
          d="M8 12H16M12 8V16"
          stroke={theme.colors.primary}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
      <Text style={styles.titleText}>{message}</Text>
      {description && <Text style={styles.subText}>{description}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  emptyContainer: {
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
    fontWeight: 'bold',
  },
  subText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: theme.colors.neutral[700],
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});
