import React from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/theme';
import { Screen, Spacer } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { scale, responsiveFontSize } from '@/utils/responsive';
import { RootNavigationProp } from '@/navigation/types';
import { useAppStore } from '@/store/app.store';
import { useTranslation } from '@/utils/localization';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const LanguageSelectScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'LanguageSelect'>>();
  const { language, setLanguage } = useAppStore();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const handleGetStarted = () => {
    navigation.navigate('Onboarding');
  };

  return (
    <Screen safeAreaBottom={false} statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content">
      <View style={[styles.container, { paddingTop: insets.top + theme.spacing.sm, paddingBottom: insets.bottom + theme.spacing.lg }]}>
        <View style={styles.contentWrapper}>
          {/* Top Illustration Graphic */}
          <View style={styles.graphicContainer}>
            <Image
              source={theme.images.cloudBlob}
              style={styles.cloudBlob}
              resizeMode="contain"
            />
          </View>

          <Spacer size="xl" />

          {/* Text Headers */}
          <Text style={styles.title}>{t('selectLanguage')}</Text>
          <Spacer size="xs" />
          <Text style={styles.subtitle}>
            {t('selectLanguageSubtitle')}
          </Text>

          <Spacer size="xxl" />

          {/* Selection Cards */}
          <View style={styles.cardsContainer}>
            {/* English Card */}
            <Pressable
              onPress={() => setLanguage('en')}
              style={[
                styles.card,
                language === 'en' ? styles.activeCard : styles.inactiveCard,
              ]}
            >
              <Text style={styles.cardText}>English</Text>
              {language === 'en' ? (
                // Active orange checkbox
                <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="10" fill={theme.colors.tertiary} />
                  <Path
                    d="M8 12L11 15L16 9"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              ) : (
                // Inactive checkbox
                <View style={styles.checkboxOutline} />
              )}
            </Pressable>

            <Spacer size="md" />

            {/* Hindi Card */}
            <Pressable
              onPress={() => setLanguage('hi')}
              style={[
                styles.card,
                language === 'hi' ? styles.activeCard : styles.inactiveCard,
              ]}
            >
              <Text style={styles.cardText}>हिंदी</Text>
              {language === 'hi' ? (
                // Active orange checkbox
                <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="10" fill={theme.colors.tertiary} />
                  <Path
                    d="M8 12L11 15L16 9"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              ) : (
                // Inactive checkbox
                <View style={styles.checkboxOutline} />
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            label={t('getStarted')}
            onPress={handleGetStarted}
            style={styles.actionBtn}
          />
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.background.layout, // #EAF2EA
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  graphicContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cloudBlob: {
    width: scale(240),
    height: scale(142),
  },
  title: {
    ...theme.typography.screenTitle,
    fontSize: responsiveFontSize(theme.typography.screenTitle.fontSize),
    color: theme.colors.neutral[900],
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.screenParagraph,
    fontSize: responsiveFontSize(theme.typography.screenParagraph.fontSize),
    color: theme.colors.neutral[700],
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  cardsContainer: {
    width: '100%',
  },
  card: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
  },
  activeCard: {
    borderColor: theme.colors.tertiary, // Orange 500
    backgroundColor: theme.colors.background.orange, // Orange 50
  },
  inactiveCard: {
    borderColor: theme.colors.neutral[200],
    backgroundColor: '#FFFFFF',
  },
  cardText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[900],
    fontWeight: '600',
  },
  checkboxOutline: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: theme.colors.neutral[200],
    backgroundColor: '#FFFFFF',
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 0,
  },
  actionBtn: {
    width: '100%',
  },
});

export default LanguageSelectScreen;
