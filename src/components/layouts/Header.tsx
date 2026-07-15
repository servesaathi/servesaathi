import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
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

  if (stepper) {
    // Progress Indicator style: back button, dashes filling the row, "n of total" at far right
    return (
      <View
        style={[
          styles.container,
          transparent && styles.transparent,
          { paddingTop: insets.top + theme.spacing.lg, paddingBottom: theme.spacing.sm },
        ]}
      >
        {leftIcon !== 'none' && (
          <IconButton
            type={leftIcon}
            accessibilityLabel={leftIcon === 'back' ? 'Go back' : 'Close'}
            onPress={handleLeftPress}
            size={40}
          />
        )}
        <View style={styles.stepperFill}>
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
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        transparent && styles.transparent,
        { paddingTop: insets.top + theme.spacing.lg, paddingBottom: theme.spacing.sm },
      ]}
    >
      {/* LEFT SECTION */}
      <View style={styles.side}>
        {leftIcon !== 'none' && (
          <IconButton
            type={leftIcon}
            accessibilityLabel={leftIcon === 'back' ? 'Go back' : 'Close'}
            onPress={handleLeftPress}
            size={40}
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
        {rightIcon !== 'none' && (
          <IconButton
            type={rightIcon}
            accessibilityLabel="Menu"
            onPress={handleRightPress}
            size={40}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xxl,
    backgroundColor: theme.colors.background.layout,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  side: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
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
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
    lineHeight: theme.typography.h2.lineHeight,
    color: theme.colors.neutral[900],
  },
  logo: {
    height: 32,
    width: 120,
  },
  stepperFill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: theme.spacing.xl,
  },
  dashesContainer: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  dash: {
    width: 24,
    height: 4,
    borderRadius: 2,
  },
  dashActive: {
    backgroundColor: theme.colors.tertiary,
  },
  dashInactive: {
    backgroundColor: theme.colors.vividOrange[200],
  },
  stepperText: {
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodySmall.fontSize),
    lineHeight: theme.typography.bodySmall.lineHeight,
    color: theme.colors.primary,
  },
});
