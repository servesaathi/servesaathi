import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';

interface InfoCardProps {
  title?: string;
  description: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  style?: StyleProp<ViewStyle>;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  type = 'info',
  style,
}) => {
  let bg = theme.colors.forestGreen[50];
  let accent = theme.colors.primary;

  if (type === 'warning') {
    bg = theme.colors.background.orange;
    accent = theme.colors.tertiary;
  } else if (type === 'error') {
    bg = theme.colors.status.errorBg;
    accent = theme.colors.status.error;
  } else if (type === 'success') {
    bg = theme.colors.forestGreen[50];
    accent = theme.colors.status.success;
  }

  return (
    <View style={[styles.infoCard, { backgroundColor: bg, borderLeftColor: accent }, style]}>
      <View style={styles.infoContent}>
        {title && <Text style={[styles.infoTitle, { color: accent }]}>{title}</Text>}
        <Text style={styles.infoDesc}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    borderLeftWidth: 4,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoContent: { flex: 1 },
  infoTitle: {
    fontFamily: theme.typography.h5.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h5.fontSize),
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  infoDesc: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: theme.colors.neutral[900],
    lineHeight: theme.typography.bodyMedium.lineHeight,
  },
});
