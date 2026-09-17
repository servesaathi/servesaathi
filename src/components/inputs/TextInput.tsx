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
import { useThemeColors } from '@/hooks/useThemeColors';

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  /** Style applied to the internal input container (overrides default border/background) */
  inputContainerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  /** Overrides the themed default (colors.text.secondary) — some Figma
   * frames (e.g. the mobile-number field) specify a brighter placeholder. */
  placeholderTextColor?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helperText,
  containerStyle,
  inputContainerStyle,
  inputStyle,
  prefixIcon,
  suffixIcon,
  onFocus,
  onBlur,
  onContentSizeChange,
  secureTextEntry,
  placeholderTextColor,
  ...props
}) => {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!error;

  // Multiline boxes (e.g. "Additional Notes") don't reliably grow with their
  // own content from style alone — `minHeight` sets a floor but RN's layout
  // doesn't keep re-measuring against it as text wraps, so typed text can
  // render past the box's bottom edge instead of the box growing to fit it.
  // Track the native-reported content height explicitly instead, floored at
  // whatever minHeight the caller asked for via inputStyle.
  const minMultilineHeight = props.multiline
    ? (StyleSheet.flatten(inputStyle)?.minHeight as number | undefined) ?? 48
    : undefined;
  const [multilineHeight, setMultilineHeight] = useState(minMultilineHeight);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };
  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };
  const handleContentSizeChange = (e: any) => {
    if (minMultilineHeight != null) {
      setMultilineHeight(Math.max(minMultilineHeight, e.nativeEvent.contentSize.height));
    }
    onContentSizeChange?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: hasError
                ? theme.colors.status.error
                : props.editable === false
                ? colors.text.muted
                : colors.text.primary,
            },
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          // multiline callers (e.g. "Additional Notes") size the RNTextInput itself via
          // inputStyle's minHeight — the container must grow with it instead of staying
          // pinned at the single-line height, or the box visibly cuts off the text area.
          props.multiline && styles.inputContainerMultiline,
          // computed theme-aware border/background
          {
            backgroundColor: colors.background.base,
            borderColor: hasError
              ? theme.colors.status.error
              : isFocused
              ? colors.accentPrimary
              : props.editable === false
              ? colors.border.hairline
              : colors.border.card,
            borderWidth: isFocused ? 1.35 : 1.5,
          },
          // allow callers to override the internal input container (e.g. transparent border)
          inputContainerStyle,
        ]}
      >
        {prefixIcon && <View style={styles.prefixIcon}>{prefixIcon}</View>}
        <RNTextInput
          placeholderTextColor={placeholderTextColor ?? colors.text.secondary}
          secureTextEntry={secureTextEntry}
          style={[
            styles.input,
            props.multiline && styles.inputMultiline,
            props.multiline && { height: multilineHeight },
            { color: colors.text.primary },
            inputStyle,
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onContentSizeChange={props.multiline ? handleContentSizeChange : onContentSizeChange}
          {...props}
        />
        {suffixIcon && <View style={styles.suffixIcon}>{suffixIcon}</View>}
      </View>

      {hasError && <Text style={styles.errorText}>{error}</Text>}
      {!hasError && helperText && (
        <Text style={[styles.helperText, { color: colors.text.muted }]}>{helperText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: theme.spacing.md, width: '100%' },
  label: {
    fontFamily: theme.typography.h5.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h5.fontSize),
    lineHeight: theme.typography.h5.lineHeight,
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.input,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.base,
  },
  // Swaps the fixed single-line height for one that grows with the multiline
  // RNTextInput's own (caller-set) minHeight, and top-aligns instead of
  // vertically centering so a tall box doesn't float its text in the middle.
  inputContainerMultiline: {
    height: undefined,
    minHeight: 48,
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[900],
    padding: 0,
  },
  inputMultiline: {
    height: undefined,
  },
  prefixIcon: { marginRight: theme.spacing.sm, justifyContent: 'center', alignItems: 'center' },
  suffixIcon: { marginLeft: theme.spacing.sm, justifyContent: 'center', alignItems: 'center' },
  errorText: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(theme.typography.caption.fontSize),
    lineHeight: theme.typography.caption.lineHeight,
    color: theme.colors.status.error,
    marginTop: theme.spacing.xs,
  },
  helperText: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(theme.typography.caption.fontSize),
    lineHeight: theme.typography.caption.lineHeight,
    color: theme.colors.neutral[500],
    marginTop: theme.spacing.xs,
  },
});
