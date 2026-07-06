import React from 'react';
import { StyleSheet, Text, View, Pressable, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';

interface IconCardProps {
  label: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

// "Icon Card" from Figma Card Views (node 103:288) — circular icon + label chip,
// used for service categories and quick-action grids.
export const IconCard: React.FC<IconCardProps> = ({ label, icon, onPress, style }) => {
  const Container = onPress ? Pressable : View;

  return (
    <Container onPress={onPress} style={[styles.card, style]}>
      <View style={styles.iconCircle}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 200,
    backgroundColor: theme.colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: theme.typography.smallCaption.fontFamily,
    fontSize: responsiveFontSize(theme.typography.smallCaption.fontSize),
    color: theme.colors.neutral[700],
    textAlign: 'center',
  },
});
