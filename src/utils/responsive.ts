import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Guideline sizes matching the Figma design frames (360×800) so that px values
// taken from the design render 1:1 on a 360dp device and scale proportionally elsewhere.
const GUIDELINE_BASE_WIDTH = 360;
const GUIDELINE_BASE_HEIGHT = 800;

export const responsiveWidth = (wPercent: number): number => {
  return (SCREEN_WIDTH * wPercent) / 100;
};

export const responsiveHeight = (hPercent: number): number => {
  return (SCREEN_HEIGHT * hPercent) / 100;
};

// Scale based on width (useful for layout spacing)
export const scale = (size: number): number => {
  return (SCREEN_WIDTH / GUIDELINE_BASE_WIDTH) * size;
};

// Vertical scale (useful for heights)
export const verticalScale = (size: number): number => {
  return (SCREEN_HEIGHT / GUIDELINE_BASE_HEIGHT) * size;
};

// Moderate scale (allows control over scaling factor)
export const moderateScale = (size: number, factor = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

// Responsive font size scaling
export const responsiveFontSize = (size: number): number => {
  const newSize = scale(size);
  const rounded = Math.round(PixelRatio.roundToNearestPixel(newSize));
  return Platform.OS === 'ios' ? rounded : rounded - 1;
};

// Determine if the device is a tablet
export const isTablet = (): boolean => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;
  
  if (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) {
    return true;
  }
  return pixelDensity >= 2 && (adjustedWidth >= 1900 || adjustedHeight >= 1900);
};

export const breakpoints = {
  smallPhone: 340,
  mediumPhone: 410,
  largePhone: 600,
  tablet: 768,
};

export const getDeviceType = (): 'smallPhone' | 'mediumPhone' | 'largePhone' | 'tablet' => {
  if (SCREEN_WIDTH >= breakpoints.tablet) return 'tablet';
  if (SCREEN_WIDTH >= breakpoints.largePhone) return 'largePhone';
  if (SCREEN_WIDTH >= breakpoints.mediumPhone) return 'mediumPhone';
  return 'smallPhone';
};
