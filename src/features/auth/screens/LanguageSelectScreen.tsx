import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/theme';
import LanguageSelectIllustrator from '../../../../assets/illustrations/language_selector_illustrator.svg';
import { Screen } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { Checkbox } from '@/components/inputs';
import { scale, responsiveFontSize } from '@/utils/responsive';
import { RootNavigationProp } from '@/navigation/types';
import { useAppStore } from '@/store/app.store';
import { useTranslation } from '@/utils/localization';

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
      <View
        style={[
          styles.container,
          {
            // Adaptive (insets.top + 118, Figma's 162px offset minus its 44px status
            // bar) but never less than 150 — on short-status-bar devices the illustrator
            // would otherwise sit uncomfortably close to the top edge.
            paddingTop: Math.max(insets.top + 118, 200),
            paddingBottom: insets.bottom + theme.spacing.xxl,
          },
        ]}
      >
        {/* Mirrors Figma's "Center Group" auto-layout frame (gap-24) */}
        <View style={styles.centerGroup}>
          <View style={styles.graphicContainer}>
            <LanguageSelectIllustrator width={scale(279)} height={scale(159)} />
          </View>

          {/* Mirrors Figma's "Text" auto-layout frame (gap-16) */}
          <View style={styles.textBlock}>
            <Text style={styles.title}>{t('selectLanguage')}</Text>
            <Text style={styles.subtitle}>
              {t('selectLanguageSubtitle')}
            </Text>
          </View>

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
              <Checkbox checked={language === 'en'} color="orange" onPress={() => setLanguage('en')} />
            </Pressable>

            {/* Hindi Card */}
            <Pressable
              onPress={() => setLanguage('hi')}
              style={[
                styles.card,
                language === 'hi' ? styles.activeCard : styles.inactiveCard,
              ]}
            >
              <Text style={styles.cardText}>हिंदी</Text>
              <Checkbox checked={language === 'hi'} color="orange" onPress={() => setLanguage('hi')} />
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
    paddingHorizontal: theme.spacing.xxl, // 24 — matches Figma's content frame px-24
    backgroundColor: theme.colors.background.layout, // #EAF2EA
  },
  centerGroup: {
    width: '100%',
    alignItems: 'center',
    gap: theme.spacing.xxl, // 24 — Figma "Center Group" gap-24 (illustration → text → cards)
  },
  graphicContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xxl, 
  },
  textBlock: {
    alignItems: 'center',
    gap: theme.spacing.lg, // 16 — Figma "Text" gap-16 (title → subtitle)
  },
  title: {
    ...(theme.typography.screenTitle as any),
    fontSize: responsiveFontSize(theme.typography.screenTitle.fontSize),
    color: theme.colors.neutral[900],
    textAlign: 'center',
  },
  subtitle: {
    ...(theme.typography.screenParagraph as any),
    fontSize: responsiveFontSize(theme.typography.screenParagraph.fontSize),
    color: theme.colors.neutral[700],
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl, // 20 — matches Figma's 272px text width centered in 312
  },
  cardsContainer: {
    width: '100%',
    gap: theme.spacing.lg, // 16 — Figma "Select Input" gap-16
  },
  card: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.radius.control,
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
