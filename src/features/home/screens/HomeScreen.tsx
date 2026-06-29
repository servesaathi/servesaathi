import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Alert,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
const TypedFlashList = FlashList as any;
import { useNavigation } from '@react-navigation/native';
import { theme } from '@/theme';
import { Screen, Container, Spacer, Divider } from '@/components/layouts';
import { IconButton } from '@/components/buttons';
import { SearchInput } from '@/components/inputs';
import { InfoCard, FeatureCard, ActionCard } from '@/components/cards';
import { useUserStore } from '@/store/user.store';
import { useAuthStore } from '@/store/auth.store';
import { scale, responsiveFontSize } from '@/utils/responsive';
import Logo from '@/components/Logo';
import { RootNavigationProp } from '@/navigation/types';
import { useTranslation, TranslationKeys } from '@/utils/localization';

interface ServiceCategory {
  id: string;
  titleKey: TranslationKeys;
  descKey: TranslationKeys;
  emoji: string;
}

const SERVICES_DATA: ServiceCategory[] = [
  {
    id: '1',
    titleKey: 'service1Title',
    descKey: 'service1Desc',
    emoji: '👵',
  },
  {
    id: '2',
    titleKey: 'service2Title',
    descKey: 'service2Desc',
    emoji: '🚶‍♂️',
  },
  {
    id: '3',
    titleKey: 'service3Title',
    descKey: 'service3Desc',
    emoji: '🏥',
  },
  {
    id: '4',
    titleKey: 'service4Title',
    descKey: 'service4Desc',
    emoji: '🍲',
  },
  {
    id: '5',
    titleKey: 'service5Title',
    descKey: 'service5Desc',
    emoji: '📚',
  },
  {
    id: '6',
    titleKey: 'service6Title',
    descKey: 'service6Desc',
    emoji: '🛒',
  },
];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'Home'>>();
  const profile = useUserStore((state) => state.profile);
  const clearProfile = useUserStore((state) => state.clearProfile);
  const logout = useAuthStore((state) => state.logout);

  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      t('login') === 'Log in' ? 'Logout' : 'लॉग आउट',
      t('login') === 'Log in' 
        ? 'Are you sure you want to log out and clear your profile?' 
        : 'क्या आप वाकई लॉग आउट करना चाहते हैं और अपनी प्रोफ़ाइल मिटाना चाहते हैं?',
      [
        { text: t('back'), style: 'cancel' },
        {
          text: t('login') === 'Log in' ? 'Logout' : 'लॉग आउट',
          style: 'destructive',
          onPress: () => {
            clearProfile();
            logout();
            navigation.replace('Splash');
          },
        },
      ]
    );
  };

  // Filtered categories based on search input
  const filteredServices = SERVICES_DATA.filter(
    (item) =>
      t(item.titleKey).toLowerCase().includes(searchQuery.toLowerCase()) ||
      t(item.descKey).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userName = profile?.name || t('guestUser');
  const userRole = profile?.role === 'care_giver' ? t('giverRole') : t('seekerRole');

  // Render header category items
  const renderHeader = () => (
    <View>
      {/* Welcome Banner */}
      <View style={styles.welcomeBanner}>
        <View>
          <Text style={styles.greeting}>{t('hello')}</Text>
          <Text style={styles.nameText}>{userName}</Text>
          {profile?.role && <Text style={styles.roleTag}>{userRole}</Text>}
        </View>
        <Text style={styles.avatarEmoji}>👋</Text>
      </View>

      <Spacer size="md" />

      {/* Verification Warning Notice */}
      {!profile ? (
        <InfoCard
          type="warning"
          title={t('showcaseTitle')}
          description={t('showcaseDesc')}
        />
      ) : (
        <InfoCard
          type="success"
          title={t('activeProfileTitle')}
          description={t('activeProfileDesc')}
        />
      )}

      <Spacer size="lg" />

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
      <Spacer size="sm" />
      
      <View style={styles.quickGrid}>
        <ActionCard
          title={t('designShowcaseTitle')}
          description={t('designShowcaseDesc')}
          onPress={() => navigation.navigate('Showcase')}
          icon={<Text style={styles.iconStyle}>🎨</Text>}
          style={styles.flexCard}
        />
        <ActionCard
          title={t('registerWizardTitle')}
          description={t('registerWizardDesc')}
          onPress={() => navigation.navigate('Login')}
          icon={<Text style={styles.iconStyle}>✍️</Text>}
          style={styles.flexCard}
        />
      </View>

      <Spacer size="xl" />

      {/* Services List Title & Search Bar */}
      <View style={styles.servicesHeaderRow}>
        <Text style={styles.sectionTitle}>{t('servicesTitle')}</Text>
        <Text style={styles.countText}>{filteredServices.length} {t('login') === 'Log in' ? 'available' : 'उपलब्ध'}</Text>
      </View>
      <Spacer size="sm" />
      
      <SearchInput
        placeholder={t('searchPlaceholder')}
        value={searchQuery}
        onChangeText={setSearchQuery}
        containerStyle={styles.searchContainer}
      />
      
      <Spacer size="sm" />
    </View>
  );

  return (
    <Screen safeAreaBottom={false} statusBarBg={theme.colors.secondary} statusBarStyle="light-content">
      {/* Header Style C */}
      <View style={styles.header}>
        <IconButton
          type="back"
          accessibilityLabel="Back button"
          onPress={() => navigation.navigate('Showcase')}
          size={36}
        />
        <Logo colorVariant="brand" size="small" />
        <IconButton
          type="close"
          bg={theme.colors.status.error}
          accessibilityLabel="Logout"
          onPress={handleLogout}
          size={36}
        />
      </View>

      {/* Core services browser with High-Performance FlashList */}
      <View style={styles.listContainer}>
        <TypedFlashList
          data={filteredServices}
          estimatedItemSize={120}
          keyExtractor={(item: any) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: any) => (
            <View style={styles.cardWrapper}>
              <FeatureCard
                title={t(item.titleKey)}
                description={t(item.descKey)}
                icon={<Text style={styles.listEmoji}>{item.emoji}</Text>}
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>{t('noServicesFound')}</Text>
            </View>
          }
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background.base,
    borderBottomWidth: 1.5,
    borderBottomColor: theme.colors.border.default,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  welcomeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background.base,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border.default,
    ...theme.shadows.sm,
  },
  greeting: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(14),
    color: theme.colors.neutral[500],
  },
  nameText: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(22),
    color: theme.colors.neutral[900],
    fontWeight: 'bold',
  },
  roleTag: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(12),
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.forestGreen[50],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  avatarEmoji: {
    fontSize: 44,
  },
  sectionTitle: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: responsiveFontSize(18),
    color: theme.colors.neutral[900],
    fontWeight: 'bold',
  },
  quickGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  flexCard: {
    flex: 1,
  },
  iconStyle: {
    fontSize: 20,
  },
  servicesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  countText: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(12),
    color: theme.colors.neutral[500],
  },
  searchContainer: {
    marginBottom: theme.spacing.sm,
  },
  cardWrapper: {
    marginBottom: theme.spacing.md,
  },
  listEmoji: {
    fontSize: 24,
  },
  emptyWrap: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    color: theme.colors.neutral[500],
    textAlign: 'center',
  },
});

export default HomeScreen;
