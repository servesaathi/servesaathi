import React, { useState } from 'react';
import { Pressable } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { theme } from '@/theme';
import { TextInput, TextInputProps } from './TextInput';

export const PasswordInput: React.FC<TextInputProps> = (props) => {
  const [isSecure, setIsSecure] = useState(true);

  const eyeIcon = (
    <Pressable onPress={() => setIsSecure(!isSecure)} accessibilityLabel="Toggle password visibility">
      {isSecure ? (
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <Path
            d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8-11-8-11-8z"
            stroke={theme.colors.neutral[700]}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle
            cx="12"
            cy="12"
            r="3"
            stroke={theme.colors.neutral[700]}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ) : (
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <Path
            d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
            stroke={theme.colors.neutral[700]}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M1 1l22 22"
            stroke={theme.colors.neutral[700]}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )}
    </Pressable>
  );

  return <TextInput secureTextEntry={isSecure} suffixIcon={eyeIcon} {...props} />;
};
