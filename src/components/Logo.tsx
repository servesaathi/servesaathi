import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ViewStyle, Animated, Platform } from 'react-native';
import { theme } from '@/theme';
import { scale, responsiveFontSize } from '@/utils/responsive';

interface LogoProps {
  colorVariant?: 'brand' | 'white';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  animatedPrefix?: boolean;
}

const REGIONAL_SERVE = [
  { text: 'Serve', lang: 'English', offsetLarge: 42, offsetMedium: 25, offsetSmall: 19, topLarge: 10, topMedium: 6, topSmall: 4 },
  { text: 'सर्व', lang: 'Hindi', offsetLarge: 18, offsetMedium: 11, offsetSmall: 8, topLarge: 14, topMedium: 9, topSmall: 6 },
  { text: 'சேவை', lang: 'Tamil', offsetLarge: 48, offsetMedium: 28, offsetSmall: 22, topLarge: 10, topMedium: 6, topSmall: 4 },
  { text: 'ਸੇਵਾ', lang: 'Punjabi', offsetLarge: 18, offsetMedium: 11, offsetSmall: 8, topLarge: 14, topMedium: 9, topSmall: 6 },
  { text: 'ಸೇವೆ', lang: 'Kannada', offsetLarge: 32, offsetMedium: 20, offsetSmall: 15, topLarge: 10, topMedium: 6, topSmall: 4 },
  { text: 'സേവനം', lang: 'Malayalam', offsetLarge: 36, offsetMedium: 22, offsetSmall: 17, topLarge: 10, topMedium: 6, topSmall: 4 },
  { text: 'సేవ', lang: 'Telugu', offsetLarge: 32, offsetMedium: 20, offsetSmall: 15, topLarge: 10, topMedium: 6, topSmall: 4 },
  { text: 'সেবা', lang: 'Bengali', offsetLarge: 18, offsetMedium: 11, offsetSmall: 8, topLarge: 14, topMedium: 9, topSmall: 6 },
];

export const Logo: React.FC<LogoProps> = ({
  colorVariant = 'brand',
  size = 'medium',
  style,
  animatedPrefix = false,
}) => {
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animatedPrefix) return;

    const interval = setInterval(() => {
      // Fade out current language
      Animated.timing(fadeAnim, {
        toValue: 0.1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Change text index
        setIndex((prevIndex) => (prevIndex + 1) % REGIONAL_SERVE.length);
        // Fade in new language
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      });
    }, 2200);

    return () => clearInterval(interval);
  }, [animatedPrefix]);

  // Determine sizes based on prop
  let serveSize = 24;
  let saathiSize = 24;
  let gap = theme.spacing.xs;

  if (size === 'small') {
    serveSize = 18;
    saathiSize = 18;
    gap = 2;
  } else if (size === 'large') {
    serveSize = 42; // Cursive is slightly larger for visual balance
    saathiSize = 36;
    gap = theme.spacing.xs;
  }

  // Determine colors based on variant
  const isWhite = colorVariant === 'white';
  const serveColor = isWhite ? '#FFFFFF' : theme.colors.tertiary; // Orange 500
  const saathiColor = isWhite ? '#FFFFFF' : theme.colors.neutral[900]; // Near-black

  const activeIndex = animatedPrefix 
    ? index 
    : (isWhite ? 0 : 1);
  const activeLang = REGIONAL_SERVE[activeIndex];
  const prefixText = activeLang.text;

  // Positioning coordinates for Shirorekha line based on active language and size
  const offsetValue = size === 'large' 
    ? activeLang.offsetLarge 
    : size === 'medium' 
    ? activeLang.offsetMedium 
    : activeLang.offsetSmall;

  const topValue = size === 'large'
    ? activeLang.topLarge
    : size === 'medium'
    ? activeLang.topMedium
    : activeLang.topSmall;

  const shirorekhaTop = scale(topValue);
  const shirorekhaLeft = scale(offsetValue);
  const shirorekhaRight = size === 'large' ? scale(10) : size === 'medium' ? scale(6) : scale(4);
  const shirorekhaHeight = size === 'large' ? 2.5 : size === 'medium' ? 1.6 : 1.2;

  return (
    <View style={[styles.container, style]}>
      {/* Shirorekha Horizontal Bar connecting Serve and Saathi */}
      <View
        style={[
          styles.shirorekha,
          {
            backgroundColor: serveColor,
            top: shirorekhaTop,
            left: shirorekhaLeft,
            right: shirorekhaRight,
            height: shirorekhaHeight,
          },
        ]}
      />
      <View style={[styles.row, { gap }]}>
        <Animated.Text
          style={[
            styles.serve,
            {
              fontSize: responsiveFontSize(serveSize),
              color: serveColor,
              lineHeight: serveSize * 1.25,
              opacity: fadeAnim,
              // Slight adjustment to align cursive baseline
              transform: [{ translateY: size === 'large' ? scale(-2) : 0 }],
            },
          ]}
        >
          {prefixText}
        </Animated.Text>
        <Text
          style={[
            styles.saathi,
            {
              fontSize: responsiveFontSize(saathiSize),
              color: saathiColor,
              lineHeight: saathiSize * 1.2,
            },
          ]}
        >
          Saathi
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  shirorekha: {
    position: 'absolute',
    borderRadius: 1.5,
    zIndex: 1,
  },
  serve: {
    // Beautiful script font for iOS, fallback for Android/Web
    fontFamily: Platform.select({
      ios: 'SnellRoundhand-Bold',
      android: 'serif',
      default: 'cursive',
    }),
    fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
    fontStyle: 'italic',
  },
  saathi: {
    fontFamily: theme.typography.h1.fontFamily,
    fontWeight: 'bold',
  },
});

export default Logo;
