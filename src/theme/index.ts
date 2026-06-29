import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { shadows } from './shadows';
import { images } from './images';

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  images,
};

export type Theme = typeof theme;

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './radius';
export * from './shadows';
