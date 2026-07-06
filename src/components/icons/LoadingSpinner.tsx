import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '@/theme';

interface LoadingSpinnerProps {
  color?: 'green' | 'orange';
  size?: number;
}

const RING_COLORS = {
  green: theme.colors.forestGreen[500],
  orange: theme.colors.vividOrange[500],
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ color = 'green', size = 60 }) => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const strokeWidth = size * 0.1;
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <Animated.View style={{ width: size, height: size, transform: [{ rotate: spin }] }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={RING_COLORS[color]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.75}, ${circumference * 0.25}`}
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
};
