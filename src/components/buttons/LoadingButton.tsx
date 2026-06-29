import React from 'react';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';
import { TertiaryButton } from './TertiaryButton';
import { DestructiveButton } from './DestructiveButton';
import { BaseButtonProps } from './types';

interface LoadingButtonProps extends BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
}

/**
 * LoadingButton — delegates to the correct variant component.
 * Primarily useful for dynamic variant selection at runtime.
 */
export const LoadingButton: React.FC<LoadingButtonProps> = ({
  variant = 'primary',
  ...props
}) => {
  switch (variant) {
    case 'secondary':
      return <SecondaryButton {...props} />;
    case 'tertiary':
      return <TertiaryButton {...props} />;
    case 'destructive':
      return <DestructiveButton {...props} />;
    case 'primary':
    default:
      return <PrimaryButton {...props} />;
  }
};
