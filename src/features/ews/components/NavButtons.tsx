import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '@/theme';
import { PrimaryButton, SecondaryButton } from '@/components/buttons';
import { useThemeColors } from '@/hooks/useThemeColors';
import ArrowLeft from '../../../../assets/ews/arrow-left.svg';

// Figma "Buttons" row (3344:323398): Forest Green/800 "← Back" and primary
// "Continue", side by side with a 24px gap.

type NavButtonsProps = {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
};

export const BackButton: React.FC<{ onPress: () => void; style?: object }> = ({ onPress, style }) => {
  const colors = useThemeColors();
  return (
    <SecondaryButton
      label="Back"
      onPress={onPress}
      style={{ ...styles.half, ...style }}
      prefixIcon={<ArrowLeft width={24} height={24} color={colors.textInverse} />}
    />
  );
};

export const NavButtons: React.FC<NavButtonsProps> = ({ onBack, onNext, nextLabel = 'Continue', nextDisabled, loading }) => (
  <View style={styles.row}>
    <BackButton onPress={onBack} />
    {/* Longer labels ("Start check-in", "Send code") get more of the row so
        they aren't cut off; one-word labels keep Figma's equal halves. */}
    <PrimaryButton
      label={nextLabel}
      onPress={onNext}
      disabled={nextDisabled}
      loading={loading}
      style={{ ...styles.half, flex: nextLabel.length > 9 ? 1.8 : 1 }}
    />
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: theme.spacing.xxl,
  },
  half: {
    flex: 1,
    width: 'auto',
  },
});

export default NavButtons;
