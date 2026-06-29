import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '@/theme';

interface SectionProps {
  children: React.ReactNode;
  bg?: string;
  radius?: keyof typeof theme.radius;
  style?: ViewStyle;
}

export const Section: React.FC<SectionProps> = ({
  children,
  bg = theme.colors.background.base,
  radius = 'lg',
  style,
}) => {
  return (
    <View
      style={[
        styles.section,
        { backgroundColor: bg, borderRadius: theme.radius[radius] },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
});
