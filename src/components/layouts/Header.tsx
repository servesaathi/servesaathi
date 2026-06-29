import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IconButton } from '@/components/buttons';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { BrandLogoSVG } from '@/components/BrandLogoSVG';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type HeaderProps = {
  title?: string;
  showLogo?: boolean;
  leftIcon?: 'back' | 'close' | 'none';
  rightIcon?: 'menu' | 'none';
  onLeftPress?: () => void;
  onRightPress?: () => void;
  stepper?: { current: number; total: number };
  transparent?: boolean;
};

export const Header: React.FC<HeaderProps> = ({
  title,
  showLogo,
  leftIcon = 'back',
  rightIcon = 'none',
  onLeftPress,
  onRightPress,
  stepper,
  transparent = false,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleLeftPress = () => {
    if (onLeftPress) {
      onLeftPress();
    } else if (leftIcon === 'back' && navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleRightPress = () => {
    if (onRightPress) {
      onRightPress();
    }
  };

  return (
    <View
      style={[
        styles.container,
        transparent && styles.transparent,
        { paddingTop: insets.top, height: 56 + insets.top },
      ]}
    >
      {/* LEFT SECTION */}
      <View style={styles.side}>
        {leftIcon !== 'none' && (
          <IconButton
            type={leftIcon}
            accessibilityLabel={leftIcon === 'back' ? 'Go back' : 'Close'}
            onPress={handleLeftPress}
            size={36}
          />
        )}
      </View>

      {/* CENTER SECTION */}
      <View style={styles.center}>
        {showLogo ? (
          <BrandLogoSVG
            width={120}
            height={32}
          />
        ) : title ? (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
      </View>

      {/* RIGHT SECTION */}
      <View style={styles.sideRight}>
        {stepper ? (
          <View style={styles.stepperContainer}>
            <View style={styles.dashesContainer}>
              {Array.from({ length: stepper.total }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dash,
                    i < stepper.current ? styles.dashActive : styles.dashInactive,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.stepperText}>
              {stepper.current} of {stepper.total}
            </Text>
          </View>
        ) : rightIcon !== 'none' ? (
          <IconButton
            type={rightIcon}
            accessibilityLabel="Menu"
            onPress={handleRightPress}
            size={36}
          />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background.layout,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  side: {
    flex: 1,
    alignItems: 'flex-start',
  },
  center: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideRight: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  title: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    color: theme.colors.neutral[900],
  },
  logo: {
    height: 32,
    width: 120,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dashesContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  dash: {
    width: 12,
    height: 3,
    borderRadius: 1.5,
  },
  dashActive: {
    backgroundColor: theme.colors.tertiary,
  },
  dashInactive: {
    backgroundColor: theme.colors.neutral[200],
  },
  stepperText: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(12),
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
