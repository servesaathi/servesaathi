import React from 'react';
import { StyleSheet, Text, View, Pressable, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { scale, responsiveFontSize } from '@/utils/responsive';

interface FeatureCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  onPress,
  style,
}) => {
  const CardContainer = onPress ? Pressable : View;

  return (
    // @ts-ignore
    <CardContainer
      onPress={onPress}
      style={({ pressed }: { pressed?: boolean }) => [
        styles.featureCard,
        onPress && pressed && styles.pressed,
        style,
      ]}
    >
      {icon && <View style={styles.featureIcon}>{icon}</View>}
      <View style={styles.featureBody}>
        <Text style={styles.featureTitle}>{title}</Text>
        {description && <Text style={styles.featureDesc}>{description}</Text>}
      </View>
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  featureCard: {
    backgroundColor: theme.colors.background.base,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border.default,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  featureIcon: {
    marginRight: theme.spacing.md,
    width: scale(48),
    height: scale(48),
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.forestGreen[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureBody: { flex: 1 },
  featureTitle: {
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h4.fontSize),
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing.xs,
  },
  featureDesc: {
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodySmall.fontSize),
    color: theme.colors.neutral[700],
  },
  pressed: { opacity: 0.7 },
});
