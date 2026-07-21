import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@/theme';
import { LogoSvg } from '@/components/LogoSvg';
import { responsiveFontSize } from '@/utils/responsive';
import { RootNavigationProp } from '@/navigation/types';
import { useTranslation } from '@/utils/localization';

const SPLASH_DISPLAY_MS = 3200;

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'Splash'>>();
  const { t } = useTranslation();

  // Load "Atkinson Hyperlegible Next" — the exact family used in the Figma design
  const [fontsLoaded] = useFonts({
    'AtkinsonHyperlegibleNext-Regular': require('../../../../assets/fonts/AtkinsonHyperlegibleNext-Regular.ttf'),
    'AtkinsonHyperlegibleNext-SemiBold': require('../../../../assets/fonts/AtkinsonHyperlegibleNext-SemiBold.ttf'),
    'AtkinsonHyperlegibleNext-Bold': require('../../../../assets/fonts/AtkinsonHyperlegibleNext-Bold.ttf'),
  });

  useEffect(() => {
    let isMounted = true;

    // Hide the native Expo splash immediately so the custom splash can appear
    // without the green launch background lingering first.
    ExpoSplashScreen.hideAsync().catch(() => {});

    const timer = setTimeout(() => {
      if (isMounted) {
        navigation.replace('LanguageSelect');
      }
    }, SPLASH_DISPLAY_MS);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [navigation]);

  const handleSkip = () => {
    navigation.replace('LanguageSelect');
  };

  const subtitleFontFamily = fontsLoaded ? theme.typography.h2.fontFamily : 'System';

  return (
    <Pressable onPress={handleSkip} style={styles.container}>
      {/* Figma: solid diagonal gradient (156.7°, Forest Green 500 → 800) with the
          leaf texture layered on top at 10% opacity */}
      <LinearGradient
        colors={['#2E7D32', '#123214']}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={styles.backgroundImage}
      />
      {/* TEMP COMP: watermarked Unsplash+ preview, used as a placeholder per team decision.
          MUST be replaced with the licensed download before any public/store release.
          (assets/illustrations/leaf_pattern.png is an owned generated fallback.) */}
      <Image
        source={require('../../../../assets/illustrations/splash_leaf_photo.jpg')}
        style={[styles.backgroundImage, styles.leafTexture]}
        resizeMode="cover"
        fadeDuration={0} // Android fades images in over 300ms by default — kill it
      />

      <View style={styles.centerContent}>
        {/* Brand Wordmark (SVG) */}
        <LogoSvg color="#FFFFFF" width={264} height={71} />

        {/* Slogan */}
        <Text style={[styles.subtitle, { fontFamily: subtitleFontFamily }]}>
          {t('splashSubtitle').replace(', ', ',\n')}
        </Text>
      </View>

    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#123214', // gradient end color — fallback paint only
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  leafTexture: {
    opacity: 0.1, // Figma: leaf image layered on the gradient at 10%
  },
  centerContent: {
    alignItems: 'center',
    width: '85%',
  },
  subtitle: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
    color: '#FFFFFF', // Pure white slogan text
    textAlign: 'center',
    marginTop: theme.spacing.xxl, // Figma: 24 gap between logo and tagline
    lineHeight: theme.typography.h2.lineHeight,
  },
});

export default SplashScreen;
