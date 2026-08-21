import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Alert } from 'react-native';
import { Screen, Header, Spacer } from '@/components/layouts';
import { theme } from '@/theme';
import { Snackbar } from '@/components/feedback';
import { responsiveFontSize } from '@/utils/responsive';
import { NOTIFICATION_GROUPS, NotificationAction } from '../data';
import NoNotificationIllustration from '../../../../assets/illustrations/no_notification.svg';
import { useThemeColors } from '@/hooks/useThemeColors';

// "Notification" (Figma 1445:12356 empty state / 1445:12601 populated) — a single screen
// that renders the empty illustration when there's nothing to show, or the grouped feed
// otherwise; accept/view actions are mocked until the notifications API exists.
export const NotificationsScreen: React.FC = () => {
  const colors = useThemeColors();
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const handleAction = (name: string, action: NotificationAction) => {
    if (action.variant === 'primary') {
      setToast({ visible: true, message: `You accepted ${name}'s invite.` });
    } else {
      Alert.alert(name, 'Full details coming soon.');
    }
  };

  const hasNotifications = NOTIFICATION_GROUPS.some((group) => group.items.length > 0);

  return (
    <Screen statusBarBg={colors.background.layout}>
      <Header title="Notification" leftIcon="back" rightIcon="notification" transparent />

      {hasNotifications ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {NOTIFICATION_GROUPS.map((group) => (
            <View key={group.id} style={styles.group}>
              <Text style={[styles.groupLabel, { color: colors.accentOrange }]}>{group.label}</Text>
              <View style={styles.itemList}>
                {group.items.map((item) => (
                  <View key={item.id} style={styles.item}>
                    <View style={styles.itemRow}>
                      <View style={styles.itemTextGroup}>
                        <View style={[styles.avatar, { backgroundColor: colors.border.hairline }]} />
                        <Text style={styles.itemText}>
                          <Text style={[styles.itemName, { color: colors.accentPrimary }]}>{item.name}</Text>
                          <Text style={[styles.itemMessage, { color: colors.text.secondary }]}> {item.message}</Text>
                        </Text>
                      </View>
                      <Text style={[styles.timestamp, { color: colors.text.muted }]}>{item.timestamp}</Text>
                    </View>
                    {item.actions && (
                      <View style={styles.actionsRow}>
                        {item.actions.map((action) => (
                          <Pressable
                            key={action.label}
                            style={[
                              styles.actionButton,
                              {
                                backgroundColor:
                                  action.variant === 'primary' ? colors.accentPrimary : colors.secondarySurface,
                              },
                            ]}
                            onPress={() => handleAction(item.name, action)}
                          >
                            <Text
                              style={[
                                styles.actionLabel,
                                { color: action.variant === 'primary' ? colors.textInverse : colors.textInverse },
                              ]}
                            >
                              {action.label}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}
          <Spacer size="giant" />
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <NoNotificationIllustration width={283} height={255} />
          <Spacer size="xl" />
          <View style={styles.emptyTextGroup}>
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>No Notification!</Text>
            <Text style={[styles.emptyBody, { color: colors.text.secondary }]}>
              You will be notified about requesting, and other informations.
            </Text>
          </View>
        </View>
      )}

      <Snackbar
        visible={toast.visible}
        message={toast.message}
        type="success"
        onDismiss={() => setToast({ visible: false, message: '' })}
        bottomOffset={100} // clear the floating bottom tab bar (this screen sits inside HelplineStack)
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
  },
  group: {
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  groupLabel: {
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h4.fontSize),
    color: theme.colors.tertiary,
  },
  itemList: {
    gap: theme.spacing.sm,
  },
  item: {
    gap: theme.spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  itemTextGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.forestGreen[100],
  },
  itemText: {
    flex: 1,
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontSize: responsiveFontSize(14),
    lineHeight: 20,
  },
  itemName: {
    fontFamily: theme.typography.h6.fontFamily,
    color: theme.colors.primary,
  },
  itemMessage: {
    fontFamily: theme.typography.bodySmall.fontFamily,
    color: theme.colors.neutral[700],
  },
  timestamp: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(theme.typography.caption.fontSize),
    color: theme.colors.neutral[500],
  },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    paddingLeft: 48, // avatar width (40) + gap (8)
  },
  actionButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.control,
  },
  actionPrimary: {
    backgroundColor: theme.colors.primary,
  },
  actionSecondary: {
    backgroundColor: theme.colors.forestGreen[600],
  },
  actionLabel: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontWeight: '500',
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
  },
  emptyTextGroup: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  emptyTitle: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h3.fontSize),
    color: theme.colors.neutral[900],
  },
  emptyBody: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[700],
    textAlign: 'center',
    maxWidth: 272,
  },
});
