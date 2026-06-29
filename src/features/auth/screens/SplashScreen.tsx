import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@/theme';
import { Logo } from '@/components/Logo';
import { responsiveFontSize, verticalScale } from '@/utils/responsive';
import { RootNavigationProp } from '@/navigation/types';
import { useAppStore } from '@/store/app.store';
import { useTranslation } from '@/utils/localization';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Custom Vector Leaf Watermark
const LeafWatermark = ({ style }: { style: any }) => (
  <Svg width="300" height="300" viewBox="0 0 100 100" fill="none" style={style}>
    {/* Outline leaf shape */}
    <Path
      d="M10 90 C 25 65, 65 65, 90 10 C 65 35, 65 75, 10 90 Z"
      fill="#FFFFFF"
      opacity={0.06}
    />
    {/* Center leaf vein */}
    <Path
      d="M10 90 C 35 65, 65 35, 90 10"
      stroke="#FFFFFF"
      strokeWidth="1.2"
      opacity={0.08}
    />
    {/* Small side veins */}
    <Path
      d="M35 65 C 45 70, 52 75, 58 82"
      stroke="#FFFFFF"
      strokeWidth="0.6"
      opacity={0.06}
    />
    <Path
      d="M55 45 C 65 50, 72 55, 78 62"
      stroke="#FFFFFF"
      strokeWidth="0.6"
      opacity={0.06}
    />
    <Path
      d="M72 28 C 80 32, 85 36, 89 42"
      stroke="#FFFFFF"
      strokeWidth="0.6"
      opacity={0.06}
    />
  </Svg>
);

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'Splash'>>();
  const setSplashVisible = useAppStore((state) => state.setSplashVisible);
  const { t } = useTranslation();

  // Load custom Atkinson Hyperlegible fonts
  const [fontsLoaded] = useFonts({
    'AtkinsonHyperlegible-Regular': require('../../../../assets/fonts/AtkinsonHyperlegible-Regular.ttf'),
    'AtkinsonHyperlegible-Bold': require('../../../../assets/fonts/AtkinsonHyperlegible-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      // Auto transition after 3.2 seconds to allow full cycle rotation view
      const timer = setTimeout(() => {
        handleSkip();
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded]);

  const handleSkip = () => {
    setSplashVisible(false);
    // Navigate to the Showcase Screen first so the user can see all components and navigate to the flow
    navigation.replace('LanguageSelect');
  };

  if (!fontsLoaded) {
    return null; // Keep native splash visible while fonts load
  }

  return (
    <Pressable onPress={handleSkip} style={styles.container}>
      {/* Background textured foliage image */}
      <Image
        source={require('../../../../assets/leaf_background.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      {/* Dark Green Gradient Overlay for readability and premium look */}
      <LinearGradient
        colors={['rgba(28, 75, 30, 0.82)', 'rgba(9, 25, 10, 0.94)']}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative leaf watermarks floating in background */}
      <LeafWatermark style={[styles.watermark, styles.watermarkTop]} />
      <LeafWatermark style={[styles.watermark, styles.watermarkBottom]} />

      <View style={styles.centerContent}>
        {/* Brand Wordmark (White) with Regional Rotation Animation */}
        <Logo colorVariant="white" size="large" animatedPrefix={true} />

        {/* Slogan */}
        <Text style={styles.subtitle}>
          {t('splashSubtitle')}
        </Text>
      </View>

      {/* Footer Indicator bar */}
      <View style={styles.footer}>
        <View style={styles.homeIndicator} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  watermark: {
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
  },
  watermarkTop: {
    top: '-5%',
    right: '-10%',
  },
  watermarkBottom: {
    bottom: '-10%',
    left: '-15%',
    transform: [{ rotate: '-135deg' }],
  },
  centerContent: {
    alignItems: 'center',
    width: SCREEN_WIDTH * 0.85,
  },
  subtitle: {
    fontFamily: 'AtkinsonHyperlegible-Regular',
    fontSize: responsiveFontSize(18),
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    opacity: 0.9,
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  homeIndicator: {
    width: 140,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
    opacity: 0.5,
  },
});

export default SplashScreen;
