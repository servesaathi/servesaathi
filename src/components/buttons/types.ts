import { ViewStyle, TextStyle } from 'react-native';

// Shared button size type
export type ButtonSize = 'small' | 'medium';

// Base props shared across all solid button variants
export interface BaseButtonProps {
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  loading?: boolean;
  size?: ButtonSize;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  accessibilityLabel?: string;
  prefixIcon?: React.ReactNode;
}
