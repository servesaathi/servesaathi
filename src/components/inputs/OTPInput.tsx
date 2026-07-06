import React, { useRef } from 'react';
import { StyleSheet, View, TextInput as RNTextInput } from 'react-native';
import { theme } from '@/theme';
import { scale, responsiveFontSize } from '@/utils/responsive';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 4,
  value,
  onChange,
  error = false,
}) => {
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
                ? theme.colors.primary
                : theme.colors.forestGreen[100],
              backgroundColor: error ? theme.colors.status.errorBg : theme.colors.neutral[50],
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
            style={styles.otpText}
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
    fontWeight: 'bold',
    color: theme.colors.neutral[900],
    width: '100%',
    height: '100%',
    padding: 0,
  },
});
