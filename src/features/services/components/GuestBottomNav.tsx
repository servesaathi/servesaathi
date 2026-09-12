import React from 'react';
import { StyleSheet, Text, View, Pressable, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/theme';
import { Icon } from '@/components/icons';
import type { IconName } from '@/components/icons';
import { responsiveFontSize } from '@/utils/responsive';
import { useThemeColors } from '@/hooks/useThemeColors';

// The visual bottom nav shown to unverified guests (Figma "Bottom Nav Bar 1",
// e.g. 2895:78682). Every tab is gated — tapping any of them runs `onLockedPress`,
// which the host screen wires to its "verify your number" flow.
const NAV_ITEMS: { key: string; label: string; icon: IconName }[] = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'hub', label: 'Hub', icon: 'grid' },
  { key: 'profile', label: 'Profile', icon: 'profile' },
  { key: 'setting', label: 'Setting', icon: 'setting' },
];

interface GuestBottomNavProps {
  onLockedPress: () => void;
  /** Lets the host measure the rendered height (to stack content above the bar). */
  onLayout?: (e: LayoutChangeEvent) => void;
}

export const GuestBottomNav: React.FC<GuestBottomNavProps> = ({ onLockedPress, onLayout }) => {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.bottomNav,
        {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border.hairline,
          paddingBottom: insets.bottom || theme.spacing.md,
        },
      ]}
    >
      <View style={styles.bottomNavContent}>
        {NAV_ITEMS.slice(0, 2).map((item) => (
          <Pressable key={item.key} style={styles.navItem} onPress={onLockedPress} accessibilityRole="button">
            <Icon name={item.icon} variant="outline" size={24} color={colors.text.muted} />
            <Text style={[styles.navLabel, { color: colors.text.muted }]}>{item.label}</Text>
          </Pressable>
        ))}

        <Pressable
          style={styles.navItem}
          onPress={onLockedPress}
          accessibilityRole="button"
          accessibilityLabel="Helpline"
        >
          <View style={[styles.helplineFab, { backgroundColor: colors.accentOrange }]}>
            <Icon name="phone" variant="outline" size={24} color="#FFFFFF" />
          </View>
          <Text style={[styles.navLabel, { color: colors.text.muted }]}>Helpline</Text>
        </Pressable>

        {NAV_ITEMS.slice(2).map((item) => (
          <Pressable key={item.key} style={styles.navItem} onPress={onLockedPress} accessibilityRole="button">
            <Icon name={item.icon} variant="outline" size={24} color={colors.text.muted} />
            <Text style={[styles.navLabel, { color: colors.text.muted }]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1.5,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  bottomNavContent: {
    flexDirection: 'row',
    minHeight: 64,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 48,
  },
  navLabel: {
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontSize: responsiveFontSize(14),
    lineHeight: 20,
    marginTop: 4,
  },
  helplineFab: {
    width: 56,
    height: 56,
    borderRadius: 200,
    marginTop: -16,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
});

export default GuestBottomNav;
