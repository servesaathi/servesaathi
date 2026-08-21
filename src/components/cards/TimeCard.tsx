import React from 'react';
import { StyleSheet, Text, View, Pressable, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { useThemeColors } from '@/hooks/useThemeColors';

export type TimeCardStatus = 'selected' | 'default' | 'disabled';

interface TimeCardProps {
  time: string;
  status?: TimeCardStatus;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

// "Time Card" from Figma Card Views (node 103:288) — time-slot chip for booking flows.
export const TimeCard: React.FC<TimeCardProps> = ({ time, status = 'default', onPress, style }) => {
  const colors = useThemeColors();
  const isSelected = status === 'selected';
  const isDisabled = status === 'disabled';
  const Container = isDisabled ? View : Pressable;

  return (
    <Container
      onPress={isDisabled ? undefined : onPress}
      style={[
        styles.card,
        isSelected
          ? { backgroundColor: colors.background.orange, borderColor: colors.accentOrange }
          : { backgroundColor: colors.background.base, borderColor: colors.border.card },
        style,
      ]}
    >
      <Text
        style={[
          styles.time,
          { color: isSelected ? colors.text.strong : isDisabled ? colors.border.card : colors.text.muted },
        ]}
      >
        {time}
      </Text>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    // minHeight, not height: the time label scales with the accessibility
    // font-size setting and must be able to grow the card, not overflow it.
    minHeight: 48,
    borderWidth: 1.5,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: theme.spacing.sm,
  },
  time: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
  },
});
