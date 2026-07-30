import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { Screen, Header } from '@/components/layouts';
import { Icon } from '@/components/icons';
import type { IconName } from '@/components/icons/iconNames.generated';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { SettingsScreen } from '@/features/settings/screens/SettingsScreen';
import { HomeScreen as HomeTabScreen } from '@/features/home/screens/HomeScreen';
import { ServicesScreen } from '@/features/services/screens/ServicesScreen';

const TabScreenLayout = ({ name, showLogo = false }: { name: string; showLogo?: boolean }) => (
  <Screen safeAreaBottom={false} style={styles.screenContent}>
    <Header title={showLogo ? undefined : name} showLogo={showLogo} leftIcon="none" />
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>{name} Screen (Coming Soon)</Text>
    </View>
  </Screen>
);

const HomeScreen = () => <HomeTabScreen />;
const ServiceScreen = () => <ServicesScreen />;
const HelplineScreen = () => <TabScreenLayout name="Helpline" />;
const SettingScreen = () => <SettingsScreen />;

export type BottomTabParamList = {
  HomeTab: undefined;
  ServiceTab: undefined;
  HelplineTab: undefined;
  ProfileTab: undefined;
  SettingTab: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

// Custom Tab Bar component to support floating action button style
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabBarContent}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;
          const isHelpline = route.name === 'HelplineTab';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const getIcon = () => {
            const color = isFocused ? theme.colors.neutral[700] : theme.colors.neutral[500];
            // Active tabs switch to the filled variant of the same glyph.
            const variant = isFocused ? 'filled' : 'outline';
            let name: IconName | null = null;
            if (route.name === 'HomeTab') name = 'home';
            if (route.name === 'ServiceTab') name = 'book';
            if (route.name === 'ProfileTab') name = 'profile';
            // Icon-set quirk: the outline glyph is named "setting", the filled one "settings".
            if (route.name === 'SettingTab') name = isFocused ? 'settings' : 'setting';
            if (!name) return null;
            return <Icon name={name} variant={variant} size={24} color={color} />;
          };

          if (isHelpline) {
            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.floatingButtonContainer}
              >
                {({ pressed }) => (
                  <>
                    <View style={[styles.floatingButton, pressed && styles.floatingButtonPressed]}>
                      {/* Outline at rest; the filled glyph is the pressed state. */}
                      <Icon name="phone" variant={pressed ? 'filled' : 'outline'} size={24} color="#FFFFFF" />
                    </View>
                    <Text style={styles.floatingButtonLabel}>Helpline</Text>
                  </>
                )}
              </Pressable>
            );
          }

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              android_ripple={{ color: theme.colors.forestGreen[100], borderless: true }}
              style={({ pressed }) => [styles.tabButton, pressed && styles.tabButtonPressed]}
            >
              {getIcon()}
              <Text
                style={[
                  styles.tabLabel,
                  isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="ServiceTab" component={ServiceScreen} options={{ tabBarLabel: 'Service' }} />
      <Tab.Screen name="HelplineTab" component={HelplineScreen} options={{ tabBarLabel: 'Helpline' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
      <Tab.Screen name="SettingTab" component={SettingScreen} options={{ tabBarLabel: 'Setting' }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.layout,
    paddingBottom: 96, // Account for absolute bottom tab bar height + safe area padding
  },
  placeholderText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(16),
    color: theme.colors.neutral[500],
  },
  tabBarContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: theme.colors.forestGreen[100], // Figma "Background/G Line" #D5E5D6
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabBarContent: {
    flexDirection: 'row',
    height: 64,
    // Figma: the five 48px-tall items sit in the bottom of the 64px bar; the
    // top 16px is the zone the helpline circle overlaps into.
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 48, // icon 24 + 4 gap + label line-height 20
    borderRadius: theme.radius.sm,
  },
  tabButtonPressed: {
    backgroundColor: theme.colors.forestGreen[50],
  },
  // Figma "Small Caption": Regular 400, 14/20 in every state — active changes
  // color only (the filled icon is the highlight).
  tabLabel: {
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontSize: responsiveFontSize(14),
    lineHeight: 20,
    marginTop: 4,
  },
  tabLabelActive: {
    color: theme.colors.neutral[700],
  },
  tabLabelInactive: {
    color: theme.colors.neutral[500],
  },
  floatingButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 64, // full bar height; circle pokes 16px above via its own margin
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 200, // Figma spec — fully round
    marginTop: -16, // Figma: circle at y -16, so its bottom lands at bar y 40
    backgroundColor: theme.colors.tertiary, // Orange 500
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  floatingButtonPressed: {
    backgroundColor: theme.colors.vividOrange[600],
  },
  floatingButtonLabel: {
    // Same "Small Caption" 14/20 as the other four tab labels (Figma uses one
    // component for all five slots).
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontSize: responsiveFontSize(14),
    lineHeight: 20,
    color: theme.colors.neutral[500],
    marginTop: 4,
  },
});
