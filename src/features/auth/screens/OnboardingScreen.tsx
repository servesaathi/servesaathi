import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  Pressable,
  Platform,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/theme';
import { Screen, Spacer } from '@/components/layouts';
import { PrimaryButton, SecondaryButton } from '@/components/buttons';
import { scale, responsiveFontSize, verticalScale } from '@/utils/responsive';
import { RootNavigationProp } from '@/navigation/types';
import { useTranslation, TranslationKeys } from '@/utils/localization';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Slide {
  id: number;
  image: any; // handles both local require and remote { uri: '...' }
  titleKey: TranslationKeys;
  descKey: TranslationKeys;
}

const SLIDES_DATA: Slide[] = [
  {
    id: 0,
    image: theme.images.onboarding1,
    titleKey: 'slide0Title',
    descKey: 'slide0Desc',
  },
  {
    id: 1,
    image: theme.images.onboarding2,
    titleKey: 'slide1Title',
    descKey: 'slide1Desc',
  },
  {
    id: 2,
    image: theme.images.onboarding3,
    titleKey: 'slide2Title',
    descKey: 'slide2Desc',
  },
];

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'Onboarding'>>();
  const [activeSlide, setActiveSlide] = useState(0);
  const { t } = useTranslation();
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (activeSlide < SLIDES_DATA.length - 1) {
      const nextIndex = activeSlide + 1;
      setActiveSlide(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }
  };

  const handleSkip = () => {
    navigation.replace('Home');
  };

  const handleCreateAccount = () => {
    navigation.replace('Login');
  };

  const handleLogin = () => {
    navigation.replace('Login');
  };

  const handleMomentumScrollEnd = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const width = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(contentOffset / width);
    setActiveSlide(index);
  };

  const getItemLayout = (_data: any, index: number) => ({
    length: SCREEN_WIDTH,
    offset: SCREEN_WIDTH * index,
    index,
  });

  return (
    <Screen safeAreaBottom={false} statusBarBg="transparent" statusBarStyle="dark-content">
      <View style={styles.container}>

        {/* Horizontal Paging FlatList for touch-swipe gesture support */}
        <FlatList
          ref={flatListRef}
          data={SLIDES_DATA}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          keyExtractor={(item) => item.id.toString()}
          getItemLayout={getItemLayout}
          style={styles.flatList}
          renderItem={({ item }) => (
            <View style={styles.slideItem}>
              {/* Top visual image section (approx 48% height) */}
              <View style={styles.imageContainer}>
                <Image
                  source={item.image}
                  style={styles.image}
                  resizeMode="cover"
                />
                {/* Beautiful smooth LinearGradient overlay blending into background */}
                <LinearGradient
                  colors={['transparent', theme.colors.background.layout]}
                  style={styles.gradientOverlay}
                />
              </View>

              {/* Content Section (Title, Subtitle) */}
              <View style={styles.contentContainer}>
                {/* Heading */}
                <Text style={styles.title}>
                  {t(item.titleKey)}
                </Text>

                <Spacer size="md" />

                {/* Description */}
                <Text style={styles.description}>
                  {t(item.descKey)}
                </Text>
              </View>
            </View>
          )}
        />

        {/* Static Footer Section (Pagination Dots and Action Buttons) */}
        <View style={styles.footerContainer}>
          {/* Stepper indicator dots */}
          <View style={styles.indicatorContainer}>
            {SLIDES_DATA.map((_, index) => {
              const isActive = index === activeSlide;
              return (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    isActive ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              );
            })}
          </View>

          <Spacer size="xxl" />

          {/* Action Row */}
          <View style={styles.actionSection}>
            {activeSlide < SLIDES_DATA.length - 1 ? (
              // Slide 1 & 2 layout: Skip (left) and Next Circle (right)
              <View style={styles.slideActionsRow}>
                <Pressable
                  onPress={handleSkip}
                  accessibilityRole="button"
                  accessibilityLabel="Skip onboarding"
                  style={({ pressed }) => [
                    styles.skipButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.skipButtonText}>{t('skip')}</Text>
                </Pressable>

                <Pressable
                  onPress={handleNext}
                  accessibilityRole="button"
                  accessibilityLabel="Next slide"
                  style={({ pressed }) => [
                    styles.nextCircleButton,
                    {
                      backgroundColor: pressed
                        ? theme.colors.forestGreen[700]
                        : theme.colors.primary,
                    },
                  ]}
                >
                  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M5 12H19M19 12L12 5M19 12L12 19"
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </Pressable>
              </View>
            ) : (
              // Slide 3: Create Account & Log In stack
              <View style={styles.lastSlideActions}>
                <PrimaryButton
                  label={t('createAccount')}
                  onPress={handleCreateAccount}
                />
                <Spacer size="md" />
                <SecondaryButton
                  label={t('login')}
                  onPress={handleLogin}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.layout, // #EAF2EA
  },
  flatList: {
    flex: 1,
  },
  slideItem: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: verticalScale(454),
    position: 'relative',
    backgroundColor: '#EAF2EA',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: scale(100),
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: scale(24),
    height: verticalScale(142),
    justifyContent: 'center',
    marginTop: verticalScale(16),
  },
  title: {
    ...theme.typography.screenTitle,
    fontSize: responsiveFontSize(theme.typography.screenTitle.fontSize),
    color: theme.colors.neutral[900],
    textAlign: 'center',
  },
  description: {
    ...theme.typography.screenParagraph,
    fontSize: responsiveFontSize(theme.typography.screenParagraph.fontSize),
    color: theme.colors.neutral[700],
    textAlign: 'center',
  },
  footerContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? scale(34) : scale(24),
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: theme.colors.tertiary, // Orange capsule
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#FFCAA3', // Orange 200 tint
    opacity: 0.7,
  },
  actionSection: {
    width: '100%',
  },
  slideActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: theme.spacing.sm,
  },
  skipButton: {
    height: 48,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary, // Forest Green 900
    ...theme.shadows.sm,
  },
  skipButtonText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(theme.typography.label.fontSize),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  nextCircleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  lastSlideActions: {
    width: '100%',
    paddingHorizontal: theme.spacing.sm,
  },

  pressed: {
    opacity: 0.8,
  },
});

export default OnboardingScreen;

