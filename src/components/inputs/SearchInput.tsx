import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TextInput, TextInputProps } from './TextInput';

export const SearchInput: React.FC<TextInputProps> = (props) => {
  const colors = useThemeColors();
  const searchIcon = (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Circle
        cx="11"
        cy="11"
        r="8"
        stroke={colors.text.secondary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 21l-4.35-4.35"
        stroke={colors.text.secondary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  return <TextInput prefixIcon={searchIcon} {...props} />;
};
