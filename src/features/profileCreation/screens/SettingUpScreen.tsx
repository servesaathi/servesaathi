import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { BrandLogoSVG } from '@/components/BrandLogoSVG';
import { responsiveFontSize, scale } from '@/utils/responsive';

// "Setting up" (Figma 1248:44478) — transition screen after profile creation, then Home.
export const SettingUpScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'SettingUp'>>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 2800);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <Screen statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content">
      <Header leftIcon="back" transparent />

      <View style={styles.content}>
        <BrandLogoSVG width={200} height={54} />
        <Spacer size="xl" />

        <Image
          source={theme.images.settingUpScribble}
          style={styles.illustration}
          resizeMode="contain"
        />

        <Spacer size="xxl" />
        <Text style={styles.message}>
          Wait a second, we are setting{'\n'}everything up for you
        </Text>

        <Spacer size="xxl" />
        <ActivityIndicator size="large" color={theme.colors.tertiary} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
  },
  illustration: {
    width: scale(303), // Figma "Setting up" scribble: 303×255
    height: scale(255),
  },
  message: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h3.fontSize),
    color: theme.colors.neutral[900],
    textAlign: 'center',
    lineHeight: 28,
  },
});

export default SettingUpScreen;
