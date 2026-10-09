import React from 'react';
import { StyleSheet, Text, TextInput as RNTextInput, View } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { useThemeColors } from '@/hooks/useThemeColors';
import { ewsText } from './text';
import Dropdown from '../../../../assets/ews/dropdown.svg';

// Figma "Input - Phone number Text" (3344:332442) — the same (+91) box +
// number field LeadCaptureModal draws, as a reusable field with a label and
// an error line.

type PhoneFieldProps = {
  label: string;
  /** Digits only, up to 10. */
  value: string;
  onChange: (digits: string) => void;
  error?: string;
  autoFocus?: boolean;
};

export const PhoneField: React.FC<PhoneFieldProps> = ({ label, value, onChange, error, autoFocus }) => {
  const colors = useThemeColors();
  const borderColor = error ? colors.error : colors.border.hairline;
  return (
    <View style={styles.wrap}>
      <Text style={[ewsText.h5, { color: colors.text.primary }]}>{label}</Text>
      <View style={styles.row}>
        <View style={[styles.cc, { backgroundColor: colors.background.base, borderColor }]}>
          <Text style={[styles.ccText, { color: colors.text.primary }]}>(+91)</Text>
          <Dropdown width={14} height={14} color={colors.text.muted} />
        </View>
        <RNTextInput
          accessibilityLabel={label}
          style={[styles.input, { backgroundColor: colors.background.base, borderColor, color: colors.text.primary }]}
          placeholder="000-000-0000"
          placeholderTextColor={colors.text.muted}
          keyboardType="number-pad"
          maxLength={10}
          autoFocus={autoFocus}
          value={value}
          onChangeText={(v) => onChange(v.replace(/\D/g, '').slice(0, 10))}
        />
      </View>
      {error && <Text style={[ewsText.small, { color: colors.error }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  cc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1.5,
    borderTopLeftRadius: theme.radius.control,
    borderBottomLeftRadius: theme.radius.control,
  },
  ccText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(16),
  },
  input: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1.5,
    borderLeftWidth: 0,
    borderTopRightRadius: theme.radius.control,
    borderBottomRightRadius: theme.radius.control,
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(16),
  },
});

export default PhoneField;
