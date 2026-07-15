import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@/theme';
import { LogoSvg } from '@/components/LogoSvg';
import { responsiveFontSize } from '@/utils/responsive';
import { RootNavigationProp } from '@/navigation/types';
import { useAppStore } from '@/store/app.store';
import { useTranslation } from '@/utils/localization';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'Splash'>>();
  const setSplashVisible = useAppStore((state) => state.setSplashVisible);
  const { t } = useTranslation();

  // Load "Atkinson Hyperlegible Next" — the exact family used in the Figma design
  const [fontsLoaded] = useFonts({
    'AtkinsonHyperlegibleNext-Regular': require('../../../../assets/fonts/AtkinsonHyperlegibleNext-Regular.ttf'),
    'AtkinsonHyperlegibleNext-SemiBold': require('../../../../assets/fonts/AtkinsonHyperlegibleNext-SemiBold.ttf'),
    'AtkinsonHyperlegibleNext-Bold': require('../../../../assets/fonts/AtkinsonHyperlegibleNext-Bold.ttf'),
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
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      {/* Dark Green Gradient Overlay for readability and premium look */}
      <LinearGradient
        colors={['rgba(46, 125, 50, 0.50)', 'rgba(18, 50, 20, 0.55)']}
        style={styles.backgroundImage}
      />

      <View style={styles.centerContent}>
        {/* Brand Wordmark (SVG) */}
        <LogoSvg color="#FFFFFF" width={264} height={71} />

        {/* Slogan */}
        <Text style={styles.subtitle}>
          {t('splashSubtitle').replace(', ', ',\n')}
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
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#09190A', // Dark green fallback matching the leaf background
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  centerContent: {
    alignItems: 'center',
    width: SCREEN_WIDTH * 0.85,
  },
  subtitle: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
    color: '#FFFFFF', // Pure white slogan text
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    lineHeight: theme.typography.h2.lineHeight,
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
