import React from 'react';
import { StyleSheet, Text, Pressable, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';

interface SettingsMenuItemProps {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

// "Sidebar Base" from Figma Sidebar (node 168:6381) — icon + label menu row, adapted from
// a fixed-width desktop sidebar item into a full-width mobile list row.
export const SettingsMenuItem: React.FC<SettingsMenuItemProps> = ({
  label,
  icon,
  active = false,
  onPress,
  style,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, active && styles.active, style]}
    >
      {icon}
      <Text style={[styles.label, { color: active ? theme.colors.vividOrange[600] : theme.colors.neutral[500] }]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  active: {
    backgroundColor: theme.colors.background.orange,
  },
  label: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(theme.typography.label.fontSize),
    lineHeight: theme.typography.label.lineHeight,
  },
});
