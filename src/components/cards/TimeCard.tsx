import React from 'react';
import { StyleSheet, Text, View, Pressable, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';

export type TimeCardStatus = 'selected' | 'default' | 'disabled';

interface TimeCardProps {
  time: string;
  status?: TimeCardStatus;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

// "Time Card" from Figma Card Views (node 103:288) — time-slot chip for booking flows.
export const TimeCard: React.FC<TimeCardProps> = ({ time, status = 'default', onPress, style }) => {
  const isSelected = status === 'selected';
  const isDisabled = status === 'disabled';
  const Container = isDisabled ? View : Pressable;

  return (
    <Container
      onPress={isDisabled ? undefined : onPress}
      style={[
        styles.card,
        isSelected ? styles.selected : styles.unselected,
        style,
      ]}
    >
      <Text
        style={[
          styles.time,
          isSelected ? styles.selectedText : isDisabled ? styles.disabledText : styles.defaultText,
        ]}
      >
        {time}
      </Text>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 48,
    borderWidth: 1.5,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: theme.spacing.sm,
  },
  selected: {
    backgroundColor: theme.colors.background.orange,
    borderColor: theme.colors.tertiary,
  },
  unselected: {
    backgroundColor: theme.colors.background.base,
    borderColor: theme.colors.border.green,
  },
  time: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
  },
  selectedText: {
    color: theme.colors.neutral[700],
  },
  defaultText: {
    color: theme.colors.neutral[500],
  },
  disabledText: {
    color: theme.colors.neutral[200],
  },
});
