import React from 'react';
import { StyleSheet, Text, View, Pressable, Alert, Linking, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Header, Spacer } from '@/components/layouts';
import { Icon } from '@/components/icons';
import { responsiveFontSize } from '@/utils/responsive';
import { QUICK_ACTIONS, EMERGENCY_SOS_NUMBER } from '../data';

// "Helpline" tab home (Figma 1317:8136) — Emergency SOS call + Quick Actions grid.
export const HelplineHomeScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'Home'>>();

  const handleSOSPress = () => {
    Alert.alert(
      'Emergency SOS Call',
      `Call emergency assistance now on ${EMERGENCY_SOS_NUMBER}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call now',
          style: 'destructive',
          onPress: () => Linking.openURL(`tel:${EMERGENCY_SOS_NUMBER}`),
        },
      ]
    );
  };

  const handleQuickAction = (id: (typeof QUICK_ACTIONS)[number]['id']) => {
    if (id === 'shareLocation') navigation.navigate('ShareLocation');
    if (id === 'supportChat') navigation.navigate('SupportChat');
    if (id === 'emResponder') navigation.navigate('EMResponder');
    if (id === 'helpline') navigation.navigate('HelplineList');
  };

  return (
    <Screen safeAreaBottom={false} statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content">
      <Header
        title="Helpline"
        leftIcon="none"
        rightIcon="notification"
        onRightPress={() => navigation.navigate('Notifications')}
      />
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.emergencyGroup}>
          <Text style={styles.emergencyLabel}>Press for immediate assistance</Text>
          <Pressable
            onPress={handleSOSPress}
            style={({ pressed }) => [styles.sosButton, pressed && styles.sosButtonPressed]}
            accessibilityRole="button"
            accessibilityLabel="Emergency SOS Call"
          >
            <Text style={styles.sosLabel}>Emergency SOS Call</Text>
          </Pressable>
        </View>

        <Spacer size="xxxl" />

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Spacer size="lg" />
        <View style={styles.grid}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.id}
              style={styles.actionCard}
              onPress={() => handleQuickAction(action.id)}
              accessibilityRole="button"
              accessibilityLabel={action.label.replace('\n', ' ')}
            >
              <View style={styles.actionArch}>
                <Icon name={action.icon} variant="outline" size={32} color={theme.colors.tertiary} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        <Spacer size="giant" />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background.layout,
  },
  content: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.xxxl,
    paddingBottom: 120, // clear the floating bottom tab bar
  },
  emergencyGroup: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  emergencyLabel: {
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h4.fontSize),
    color: theme.colors.status.error,
    textAlign: 'center',
  },
  sosButton: {
    width: '100%',
    height: 80,
    borderRadius: theme.radius.control,
    backgroundColor: theme.colors.status.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  sosButtonPressed: {
    backgroundColor: '#B91C1C',
  },
  sosLabel: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(20),
    lineHeight: 30,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h3.fontSize),
    color: theme.colors.neutral[900],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  actionCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: theme.colors.background.base,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  actionArch: {
    width: '100%',
    height: 72,
    backgroundColor: theme.colors.vividOrange[100],
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  actionLabel: {
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodySmall.fontSize),
    color: theme.colors.neutral[700],
    textAlign: 'center',
  },
});
