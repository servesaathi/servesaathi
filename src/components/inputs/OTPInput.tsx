import React, { useRef } from 'react';
import { StyleSheet, View, TextInput as RNTextInput } from 'react-native';
import { theme } from '@/theme';
import { scale, responsiveFontSize } from '@/utils/responsive';
import { useThemeColors } from '@/hooks/useThemeColors';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  /** Fired once every box is filled — lets callers auto-submit without a manual tap. */
  onComplete?: (value: string) => void;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 4,
  value,
  onChange,
  error = false,
  onComplete,
}) => {
  const colors = useThemeColors();
  const inputRefs = useRef<RNTextInput[]>([]);
  const otpArray = value.split('').concat(Array(length).fill('')).slice(0, length);

  const handleTextChange = (text: string, index: number) => {
    const newOtpArray = [...otpArray];
    newOtpArray[index] = text;
    const newValue = newOtpArray.join('');
    onChange(newValue);
    if (text !== '' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (text !== '' && newValue.length === length) {
      inputRefs.current[index]?.blur();
      onComplete?.(newValue);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otpArray[index] === '' && index > 0) {
      const newOtpArray = [...otpArray];
      newOtpArray[index - 1] = '';
      onChange(newOtpArray.join(''));
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.otpRow}>
      {otpArray.map((digit, index) => (
        <View
          key={index}
          style={[
            styles.otpBox,
            {
              borderColor: error
                ? theme.colors.status.error
                : digit
                ? colors.accentPrimary
                : colors.border.hairline,
              backgroundColor: error ? theme.colors.status.errorBg : colors.background.base,
            },
          ]}
        >
          <RNTextInput
            ref={(ref) => {
              if (ref) inputRefs.current[index] = ref;
            }}
            maxLength={1}
            keyboardType="number-pad"
            value={digit}
            onChangeText={(text) => handleTextChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            style={[styles.otpText, { color: colors.text.primary }]}
            selectTextOnFocus
            textAlign="center"
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: scale(280),
    alignSelf: 'center',
    marginVertical: theme.spacing.md,
  },
  otpBox: {
    width: scale(64),
    height: scale(64),
    borderWidth: 1.5,
    borderRadius: theme.radius.sm, // 8px per design spec
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpText: {
    fontFamily: theme.typography.h1.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h1.fontSize),
    color: theme.colors.neutral[900],
    width: '100%',
    height: '100%',
    padding: 0,
  },
});
