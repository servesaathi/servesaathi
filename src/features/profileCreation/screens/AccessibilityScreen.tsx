import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { ToggleSwitch } from '@/components/inputs';
import { responsiveFontSize } from '@/utils/responsive';

// "Profile Creation 6a" (Figma 1248:44362) — step 6 of 6: Accessibility preferences.
type FontSizeOption = 0 | 1 | 2; // small / medium / large

const FONT_PREVIEW_SIZES: Record<FontSizeOption, number> = { 0: 14, 1: 16, 2: 19 };

export const AccessibilityScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'ProfileAccessibility'>>();
  const [fontSize, setFontSize] = useState<FontSizeOption>(1);
  const [voiceCommands, setVoiceCommands] = useState(false);
  const [contrast, setContrast] = useState<'normal' | 'high'>('normal');

  const handleContinue = () => {
    // Figma flow: Accessibility → Subscription → Payment method → Setting up
    navigation.navigate('Subscription');
  };

  return (
    <Screen scrollable statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content">
      <Header leftIcon="back" transparent stepper={{ current: 6, total: 6 }} />

      <View style={styles.content}>
        <Spacer size="lg" />
        <Text style={styles.title}>Accessibility</Text>
        <Spacer size="xl" />

        <Text style={styles.sectionLabel}>Font Size</Text>
        <View style={styles.previewCard}>
          <Text style={[styles.previewText, { fontSize: responsiveFontSize(FONT_PREVIEW_SIZES[fontSize]) }]}>
            The quick brown fox jumps over the lazy dog.
          </Text>
        </View>

        <Spacer size="xl" />

        {/* Font size slider: 3 stops (A / A / A) */}
        <View style={styles.sliderTrack}>
          <View style={styles.trackLine} />
          {[0, 1, 2].map((stop) => (
            <Pressable
              key={stop}
              onPress={() => setFontSize(stop as FontSizeOption)}
              hitSlop={16}
              style={styles.stopTouch}
            >
              {fontSize === stop && <View style={styles.thumb} />}
            </Pressable>
          ))}
        </View>
        <View style={styles.sliderLabels}>
          {([0, 1, 2] as FontSizeOption[]).map((stop) => (
            <Pressable key={stop} onPress={() => setFontSize(stop)} hitSlop={12}>
              <Text
                style={[
                  styles.sliderLabel,
                  { fontSize: responsiveFontSize(14 + stop * 5) },
                  fontSize === stop && styles.sliderLabelActive,
                ]}
              >
                A
              </Text>
            </Pressable>
          ))}
        </View>

        <Spacer size="xl" />

        <Text style={styles.sectionLabel}>Visual &amp; Input</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Voice commands</Text>
          <ToggleSwitch value={voiceCommands} onValueChange={setVoiceCommands} color="orange" />
        </View>

        <Spacer size="sm" />
        <Text style={styles.toggleLabel}>Color contrast</Text>
        <Spacer size="md" />

        <View style={styles.contrastRow}>
          <Pressable
            onPress={() => setContrast('normal')}
            style={[styles.contrastCard, contrast === 'normal' && styles.contrastCardActive]}
          >
            <View style={styles.contrastSwatchNormal} />
            <Spacer size="md" />
            <Text style={styles.contrastLabel}>Normal</Text>
          </Pressable>
          <Pressable
            onPress={() => setContrast('high')}
            style={[styles.contrastCard, contrast === 'high' && styles.contrastCardActive]}
          >
            <View style={styles.contrastSwatchHigh} />
            <Spacer size="md" />
            <Text style={styles.contrastLabel}>High contrast</Text>
          </Pressable>
        </View>

        <Spacer size="xxl" />
        <View style={styles.footer}>
          <PrimaryButton label="Continue" onPress={handleContinue} />
        </View>
        <Spacer size="xl" />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  title: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
    color: theme.colors.neutral[900],
    textAlign: 'center',
  },
  sectionLabel: {
    fontFamily: theme.typography.h5.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h5.fontSize),
    lineHeight: theme.typography.h5.lineHeight,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing.sm,
  },
  previewCard: {
    backgroundColor: theme.colors.background.base,
    borderRadius: theme.radius.input,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  previewText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    color: theme.colors.neutral[900],
    textAlign: 'center',
    lineHeight: 24,
  },
  sliderTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 20,
  },
  trackLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.forestGreen[100],
  },
  stopTouch: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.tertiary,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    ...theme.shadows.sm,
  },
  sliderLabels: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  sliderLabel: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    color: theme.colors.neutral[700],
  },
  sliderLabelActive: {
    color: theme.colors.neutral[900],
    fontFamily: theme.fonts.bold,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  toggleLabel: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[800],
  },
  contrastRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  contrastCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    borderRadius: theme.radius.input,
    borderWidth: 1.5,
    borderColor: theme.colors.border.green,
    backgroundColor: theme.colors.background.base,
  },
  contrastCardActive: {
    borderColor: theme.colors.tertiary,
    backgroundColor: theme.colors.background.orange,
  },
  contrastSwatchNormal: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.neutral[100],
  },
  contrastSwatchHigh: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.neutral[900],
  },
  contrastLabel: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[700],
  },
  footer: {
    marginTop: 'auto',
  },
});

export default AccessibilityScreen;
