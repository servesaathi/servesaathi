import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { Screen, Header, Spacer, SettingsMenuItem } from '@/components/layouts';
import { Icon } from '@/components/icons';
import type { IconName } from '@/components/icons';

interface MenuItemConfig {
  label: string;
  icon: IconName;
  active?: boolean;
  onPress?: () => void;
}

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const groups: { title: string; items: MenuItemConfig[] }[] = [
    {
      title: 'Account',
      items: [
        { label: 'Edit Profile', icon: 'profile' },
        { label: 'Change Password', icon: 'key' },
        { label: 'Payment Method', icon: 'payment' },
      ],
    },
    {
      title: 'General',
      items: [
        { label: 'Language', icon: 'language' },
        { label: 'Accessibility', icon: 'accessibility' },
        { label: 'Privacy Data', icon: 'safety' },
        { label: 'Notification', icon: 'notification' },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Report an issue', icon: 'error' },
        { label: 'Help & Support', icon: 'help' },
        { label: 'Delete Account', icon: 'delete' },
        {
          label: 'Log out',
          icon: 'signOut',
          onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
        },
      ],
    },
  ];

  return (
    <Screen safeAreaBottom={false} style={styles.screen}>
      <Header title="Settings" leftIcon="none" />
      <View style={styles.content}>
        {groups.map((group) => (
          <View key={group.title}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <Spacer size="sm" />
            {group.items.map((item) => (
              <SettingsMenuItem
                key={item.label}
                label={item.label}
                active={item.active}
                icon={
                  <Icon
                    name={item.icon}
                    variant="outline"
                    size={24}
                    color={item.active ? theme.colors.vividOrange[600] : theme.colors.neutral[500]}
                  />
                }
                onPress={item.onPress}
              />
            ))}
            <Spacer size="lg" />
          </View>
        ))}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
  },
  groupTitle: {
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h4.fontSize),
    color: theme.colors.primary,
  },
});

export default SettingsScreen;
