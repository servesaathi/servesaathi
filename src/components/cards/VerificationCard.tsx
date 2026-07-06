import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { StatusChip } from './StatusChip';

interface VerificationCardProps {
  subheadline: string;
  title: string;
  title2: string;
  status?: 'verified' | 'dueSoon';
  style?: StyleProp<ViewStyle>;
}

// "Verification ID Card" from Figma Card Views (node 103:288) — document/ID verification
// status row.
export const VerificationCard: React.FC<VerificationCardProps> = ({
  subheadline,
  title,
  title2,
  status = 'verified',
  style,
}) => {
  const isVerified = status === 'verified';

  return (
    <View style={[styles.card, style]}>
      <View style={styles.textCol}>
        <Text style={styles.subheadline}>{subheadline}</Text>
        <View style={styles.subRow}>
          <Text style={styles.subText}>{title}</Text>
          <Text style={[styles.subText, { color: theme.colors.forestGreen[600] }]}> · </Text>
          <Text style={styles.subText}>{title2}</Text>
        </View>
      </View>
      <StatusChip
        label={isVerified ? 'Verified' : 'Due Soon'}
        bgColor={isVerified ? theme.colors.forestGreen[100] : theme.colors.vividOrange[100]}
        textColor={isVerified ? theme.colors.forestGreen[700] : theme.colors.vividOrange[700]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background.base,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  textCol: {
    gap: 2,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subheadline: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[700],
  },
  subText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[500],
  },
});
