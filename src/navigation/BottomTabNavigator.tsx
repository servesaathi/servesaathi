import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ClipboardList, User, Settings, Phone } from 'lucide-react-native';
import HomeScreen from '@/features/home/screens/HomeScreen';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';

// Placeholder screens for other tabs
const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.placeholderContainer}>
    <Text>{name} Screen (Coming Soon)</Text>
  </View>
);

const ServiceScreen = () => <PlaceholderScreen name="Service" />;
const HelplineScreen = () => <PlaceholderScreen name="Helpline" />;
const ProfileScreen = () => <PlaceholderScreen name="Profile" />;
const SettingScreen = () => <PlaceholderScreen name="Setting" />;

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
  return (
    <View style={styles.tabBarContainer}>
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
            const color = isFocused && !isHelpline ? theme.colors.neutral[900] : theme.colors.neutral[500];
            const size = 24;

            if (route.name === 'HomeTab') return <Home color={color} size={size} />;
            if (route.name === 'ServiceTab') return <ClipboardList color={color} size={size} />;
            if (route.name === 'ProfileTab') return <User color={color} size={size} />;
            if (route.name === 'SettingTab') return <Settings color={color} size={size} />;
            return null;
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
                <View style={styles.floatingButton}>
                  <Phone color="#FFFFFF" size={28} />
                </View>
                <Text style={styles.floatingButtonLabel}>Helpline</Text>
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
              style={styles.tabButton}
            >
              {getIcon()}
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? theme.colors.neutral[900] : theme.colors.neutral[500] },
                ]}
              >
                {label}
              </Text>
              {isFocused && <View style={styles.activeIndicator} />}
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
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.layout,
  },
  tabBarContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingBottom: 24, // Assuming safe area bottom
  },
  tabBarContent: {
    flexDirection: 'row',
    height: 72,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.sm,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingTop: 8,
  },
  tabLabel: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(11),
    marginTop: 4,
    fontWeight: '500',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 20,
    height: 2,
    backgroundColor: theme.colors.neutral[900],
    borderRadius: 1,
  },
  floatingButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '100%',
    marginTop: -32, // Float above the bar
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.tertiary, // Orange 500
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
    borderWidth: 4,
    borderColor: '#FFFFFF', // White stroke around it matching the design
  },
  floatingButtonLabel: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(11),
    color: theme.colors.neutral[500],
    marginTop: 4,
    fontWeight: '500',
  },
});
