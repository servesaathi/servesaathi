import { describe, test, expect, jest } from '@jest/globals';

// Mock react-native BEFORE importing responsive.ts.
// 360×800 matches the Figma guideline base, so scaling is identity on this device.
jest.mock('react-native', () => ({
  Dimensions: {
    get: () => ({ width: 360, height: 800 }),
  },
  PixelRatio: {
    get: () => 2,
    roundToNearestPixel: (size: number) => size,
  },
  Platform: {
    OS: 'ios',
    select: (obj: any) => obj.ios,
  },
}));

import {
  scale,
  verticalScale,
  moderateScale,
  breakpoints,
  getDeviceType,
} from '../responsive';

describe('Responsive Layout Utilities', () => {
  test('should scale size proportionally based on screen width', () => {
    const scaledSize = scale(100);
    expect(typeof scaledSize).toBe('number');
    expect(scaledSize).toBe(100); // Because width is mock 360 (360/360 = 1)
  });

  test('should verticalScale size proportionally based on screen height', () => {
    const verticalScaledSize = verticalScale(100);
    expect(typeof verticalScaledSize).toBe('number');
    expect(verticalScaledSize).toBe(100); // Height mock 800 (800/800 = 1)
  });

  test('should compute moderateScale correctly with factors', () => {
    const result = moderateScale(100);
    expect(typeof result).toBe('number');
    expect(result).toBe(100);
  });

  test('should define correct breakpoints', () => {
    expect(breakpoints.smallPhone).toBe(340);
    expect(breakpoints.tablet).toBe(768);
  });

  test('should return a valid device type', () => {
    const deviceType = getDeviceType();
    expect(['smallPhone', 'mediumPhone', 'largePhone', 'tablet']).toContain(deviceType);
  });
});
