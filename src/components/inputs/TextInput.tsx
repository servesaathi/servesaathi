import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
  TextInputProps as RNTextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helperText,
  containerStyle,
  inputStyle,
  prefixIcon,
  suffixIcon,
  onFocus,
  onBlur,
  secureTextEntry,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!error;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };
  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: hasError ? theme.colors.status.error : theme.colors.neutral[900] },
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: hasError
              ? theme.colors.status.error
              : isFocused
              ? theme.colors.primary
              : theme.colors.border.default,
            backgroundColor: hasError ? theme.colors.status.errorBg : theme.colors.neutral[50],
          },
        ]}
      >
        {prefixIcon && <View style={styles.prefixIcon}>{prefixIcon}</View>}
        <RNTextInput
          placeholderTextColor={theme.colors.neutral[500]}
          secureTextEntry={secureTextEntry}
          style={[styles.input, inputStyle]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {suffixIcon && <View style={styles.suffixIcon}>{suffixIcon}</View>}
      </View>

      {hasError && <Text style={styles.errorText}>{error}</Text>}
      {!hasError && helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: theme.spacing.md, width: '100%' },
  label: {
    fontFamily: theme.typography.smallCaption.fontFamily,
    fontSize: responsiveFontSize(theme.typography.smallCaption.fontSize),
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: theme.radius.sm, // 6px consistent with buttons
    paddingHorizontal: theme.spacing.md,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[900],
    padding: 0,
  },
  prefixIcon: { marginRight: theme.spacing.sm, justifyContent: 'center', alignItems: 'center' },
  suffixIcon: { marginLeft: theme.spacing.sm, justifyContent: 'center', alignItems: 'center' },
  errorText: {
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodySmall.fontSize),
    color: theme.colors.status.error,
    marginTop: theme.spacing.xs,
  },
  helperText: {
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodySmall.fontSize),
    color: theme.colors.neutral[500],
    marginTop: theme.spacing.xs,
  },
});
