import React from 'react';
import { StyleSheet, Text, View, Pressable, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Icon } from '@/components/icons';

export type SettingsMenuItemVariant = 'default' | 'danger' | 'safe';

interface SettingsMenuItemProps {
  label: string;
  icon: React.ReactNode;
  variant?: SettingsMenuItemVariant;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const VARIANT_STYLES: Record<SettingsMenuItemVariant, { accent: string; iconBg: string }> = {
  default: { accent: theme.colors.tertiary, iconBg: theme.colors.vividOrange[100] },
  danger: { accent: theme.colors.status.error, iconBg: theme.colors.status.errorBorder },
  safe: { accent: theme.colors.primary, iconBg: theme.colors.background.layout },
};

// "Field Card View" from Figma Settings (node 1432:38979) — icon-circle + label row with
// a colored left accent border and a matching chevron, used throughout the Settings menu.
export const SettingsMenuItem: React.FC<SettingsMenuItemProps> = ({
  label,
  icon,
  variant = 'default',
  onPress,
  style,
}) => {
  const { accent, iconBg } = VARIANT_STYLES[variant];
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, { backgroundColor: colors.background.base, borderLeftColor: accent }, style]}
    >
      <View style={styles.left}>
        <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>{icon}</View>
        <Text style={[styles.label, { color: colors.text.secondary }]}>{label}</Text>
      </View>
      <View style={styles.chevronCircle}>
        <Icon name="navigationRight" variant="outline" size={20} color={accent} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: theme.colors.background.base,
    borderLeftWidth: 4,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    overflow: 'hidden',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronCircle: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[700],
  },
});
