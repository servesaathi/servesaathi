import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Mic } from 'lucide-react-native';
import { RootNavigationProp, RootRouteProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { ToggleSwitch, Slider } from '@/components/inputs';
import { responsiveFontSize } from '@/utils/responsive';
import { masterdataService, careProfileService, getErrorMessage, type MasterDataOption } from '@/api';
import { useAccessibilityStore, FONT_SIZE_MIN, FONT_SIZE_MAX } from '@/store/accessibility.store';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useVoiceCommands, type VoiceCommand } from '@/hooks/useVoiceCommands';
import { speak } from '@/services/voice';

// "Profile Creation 6a" (Figma 1248:44362) — step 6 of 6: Accessibility preferences.
// Choices are applied live app-wide (global Text patch reads the accessibility
// store, and useThemeColors() reacts to the high-contrast toggle) and persisted
// to the backend care profile on Continue.
//
// Also reachable from Settings → Accessibility (route param `fromSettings`),
// reusing this same screen so there's exactly one place these preferences are
// edited. In that mode the onboarding stepper/"Continue → Subscription" chrome
// is swapped for a normal header + "Save" that just goes back.
//
// Font size is a real drag-anywhere slider (src/components/inputs/Slider.tsx),
// continuous across FONT_SIZE_MIN..FONT_SIZE_MAX (accessibility.store.ts) —
// bounded to the default (16pt) ± 3pt, in 0.5pt-per-step increments, so it
// can't be dragged into an unreadable or layout-breaking size.
const FONT_SIZE_STEP = 0.5;
const VOICE_FONT_STEP = 2;
// Backend fontSize is 1 (smallest) … 5 (largest); the continuous 13–19pt slider
// maps linearly onto that 5-point scale.
const API_FONT_SIZE_MIN = 1;
const API_FONT_SIZE_MAX = 5;
const toApiFontSize = (size: number): number => {
  const ratio = (size - FONT_SIZE_MIN) / (FONT_SIZE_MAX - FONT_SIZE_MIN);
  return Math.round(API_FONT_SIZE_MIN + ratio * (API_FONT_SIZE_MAX - API_FONT_SIZE_MIN));
};

const VOICE_HELP =
  'You can say: bigger text, smaller text, high contrast, normal contrast, or continue.';

export const AccessibilityScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'ProfileAccessibility'>>();
  const route = useRoute<RootRouteProp<'ProfileAccessibility'>>();
  const fromSettings = route.params?.fromSettings ?? false;
  const colors = useThemeColors();
  const fontSize = useAccessibilityStore((s) => s.fontSize);
  const setFontSize = useAccessibilityStore((s) => s.setFontSize);
  const highContrast = useAccessibilityStore((s) => s.highContrast);
  const setHighContrast = useAccessibilityStore((s) => s.setHighContrast);
  const voiceCommands = useAccessibilityStore((s) => s.voiceCommandsEnabled);
  const setVoiceCommands = useAccessibilityStore((s) => s.setVoiceCommandsEnabled);
  const resetToDefaults = useAccessibilityStore((s) => s.resetToDefaults);
  const [contrastOptions, setContrastOptions] = useState<MasterDataOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    masterdataService
      .getColorContrasts()
      .then(setContrastOptions)
      .catch(() => setContrastOptions([]));
  }, []);

  // Live-updates the store on every drag frame (setFontSize clamps to
  // FONT_SIZE_MIN..FONT_SIZE_MAX itself) so the preview card and every other
  // Text on screen tracks the thumb in real time.
  const changeFontSize = (size: number) => setFontSize(size);

  // Announced once, on release/tap-up — not per drag frame, or voice
  // guidance would try to speak dozens of times a second while dragging.
  const announceFontSize = (size: number) => {
    if (voiceCommands) speak(`Font size ${size} points.`);
  };

  // Announce before resetting — voice commands themselves get turned off by
  // the reset, so speaking after would silently do nothing.
  const handleReset = () => {
    if (voiceCommands) speak('Reset to default.');
    resetToDefaults();
  };

  const changeContrast = (high: boolean) => {
    setHighContrast(high);
    if (voiceCommands) speak(high ? 'High contrast on.' : 'Normal contrast.');
  };

  const handleVoiceToggle = (enabled: boolean) => {
    setVoiceCommands(enabled);
    if (enabled) {
      speak(
        voice.available
          ? `Voice commands are on. Tap the microphone button and speak. ${VOICE_HELP}`
          : 'Voice guidance is on. Your changes will be read aloud. Voice input needs the full ServeSaathi app and is not available in this preview.'
      );
    }
  };

  const handleContinue = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // The normal/high cards map onto the color-contrast master data by label.
      const highOption = contrastOptions.find((o) => /high/i.test(o.label));
      const normalOption = contrastOptions.find((o) => !/high/i.test(o.label));
      const contrastOption = highContrast ? highOption : normalOption;
      await careProfileService.updateCareProfile({
        fontSize: toApiFontSize(fontSize),
        voiceCommandsEnabled: voiceCommands,
        ...(contrastOption ? { colorContrastId: Number(contrastOption.id) } : {}),
      });
      if (fromSettings) {
        if (voiceCommands) speak('Preferences saved.');
        navigation.goBack();
      } else {
        // Figma flow: Accessibility → Subscription → Payment method → Setting up
        navigation.navigate('Subscription');
      }
    } catch (err) {
      const message = getErrorMessage(err);
      setSubmitError(message);
      if (voiceCommands) speak(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoiceCommand = (command: VoiceCommand) => {
    switch (command.type) {
      case 'fontUp': {
        const next = Math.min(FONT_SIZE_MAX, fontSize + VOICE_FONT_STEP);
        changeFontSize(next);
        announceFontSize(next);
        break;
      }
      case 'fontDown': {
        const next = Math.max(FONT_SIZE_MIN, fontSize - VOICE_FONT_STEP);
        changeFontSize(next);
        announceFontSize(next);
        break;
      }
      case 'contrast':
        changeContrast(command.high);
        break;
      case 'continue':
        speak('Saving your preferences.');
        handleContinue();
        break;
      case 'help':
        speak(VOICE_HELP);
        break;
    }
  };

  const voice = useVoiceCommands({ enabled: voiceCommands, onCommand: handleVoiceCommand });

  return (
    <Screen scrollable statusBarBg={colors.background.layout}>
      {fromSettings ? (
        <Header leftIcon="back" title="Accessibility" />
      ) : (
        <Header leftIcon="back" transparent stepper={{ current: 6, total: 6 }} />
      )}

      <View style={styles.content}>
        <Spacer size="lg" />
        {!fromSettings && (
          <>
            <Text style={[styles.title, { color: colors.text.primary }]} accessibilityRole="header">
              Accessibility
            </Text>
            <Spacer size="xl" />
          </>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionLabel, { color: colors.text.primary }]}>Font Size</Text>
          <Pressable
            onPress={handleReset}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Reset accessibility settings to default"
          >
            <Text style={[styles.resetLabel, { color: colors.accentOrange }]}>Reset to Default</Text>
          </Pressable>
        </View>
        <View style={[styles.previewCard, { backgroundColor: colors.background.base }]}>
          <Text
            style={[
              styles.previewText,
              { color: colors.text.primary, fontSize: responsiveFontSize(fontSize) },
            ]}
          >
            The quick brown fox jumps over the lazy dog.
          </Text>
        </View>

        <Spacer size="xl" />

        {/* Drag-anywhere slider, bounded FONT_SIZE_MIN..FONT_SIZE_MAX (13–19pt, default±3, 0.5pt steps) */}
        <View style={styles.sliderRow}>
          <Text style={[styles.sliderEndLabel, { color: colors.text.secondary, fontSize: responsiveFontSize(13) }]}>
            A
          </Text>
          <Slider
            style={styles.sliderFlex}
            min={FONT_SIZE_MIN}
            max={FONT_SIZE_MAX}
            step={FONT_SIZE_STEP}
            value={fontSize}
            onChange={changeFontSize}
            onChangeEnd={announceFontSize}
            accessibilityLabel="Font size"
            trackColor={colors.border.hairline}
            activeTrackColor={colors.accentOrange}
            thumbColor={colors.accentOrange}
          />
          <Text style={[styles.sliderEndLabel, { color: colors.text.secondary, fontSize: responsiveFontSize(22) }]}>
            A
          </Text>
        </View>
        <Text style={[styles.sliderValueLabel, { color: colors.text.secondary }]}>{fontSize}pt</Text>

        <Spacer size="xl" />

        <Text style={[styles.sectionLabel, { color: colors.text.primary }]}>Visual &amp; Input</Text>
        <View style={styles.toggleRow}>
          <Text style={[styles.toggleLabel, { color: colors.text.strong }]}>Voice commands</Text>
          <ToggleSwitch value={voiceCommands} onValueChange={handleVoiceToggle} color="orange" />
        </View>

        {voiceCommands && voice.available && (
          <>
            <Spacer size="sm" />
            <Pressable
              onPress={voice.listening ? voice.stopVoiceInput : voice.startVoiceInput}
              style={[
                styles.micButton,
                { backgroundColor: colors.background.orange, borderColor: colors.accentOrange },
                voice.listening && { backgroundColor: colors.accentOrange },
              ]}
              accessibilityRole="button"
              accessibilityLabel={voice.listening ? 'Stop listening' : 'Speak a command'}
              accessibilityHint={VOICE_HELP}
            >
              <Mic size={22} color={voice.listening ? '#FFFFFF' : colors.accentOrange} />
              <Text style={[styles.micLabel, { color: voice.listening ? '#FFFFFF' : colors.accentOrange }]}>
                {voice.listening ? 'Listening…' : 'Tap to speak a command'}
              </Text>
            </Pressable>
          </>
        )}
        {voiceCommands && !voice.available && (
          <Text style={[styles.voiceNote, { color: colors.text.tertiary }]}>
            Voice input needs the full ServeSaathi app build. Voice guidance will still read your
            changes aloud.
          </Text>
        )}

        <Spacer size="sm" />
        <Text style={[styles.toggleLabel, { color: colors.text.strong }]}>Color contrast</Text>
        <Spacer size="md" />

        <View style={styles.contrastRow}>
          <Pressable
            onPress={() => changeContrast(false)}
            style={[
              styles.contrastCard,
              { backgroundColor: colors.background.base, borderColor: colors.border.card },
              !highContrast && { backgroundColor: colors.background.orange, borderColor: colors.accentOrange },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Normal contrast"
            accessibilityState={{ selected: !highContrast }}
          >
            <View style={styles.contrastSwatchNormal} />
            <Spacer size="md" />
            <Text style={[styles.contrastLabel, { color: colors.text.secondary }]}>Normal</Text>
          </Pressable>
          <Pressable
            onPress={() => changeContrast(true)}
            style={[
              styles.contrastCard,
              { backgroundColor: colors.background.base, borderColor: colors.border.card },
              highContrast && { backgroundColor: colors.background.orange, borderColor: colors.accentOrange },
            ]}
            accessibilityRole="button"
            accessibilityLabel="High contrast"
            accessibilityState={{ selected: highContrast }}
          >
            <View style={styles.contrastSwatchHigh} />
            <Spacer size="md" />
            <Text style={[styles.contrastLabel, { color: colors.text.secondary }]}>High contrast</Text>
          </Pressable>
        </View>

        <Spacer size="xxl" />
        <View style={styles.footer}>
          {submitError && <Text style={styles.submitError}>{submitError}</Text>}
          <PrimaryButton label={fromSettings ? 'Save' : 'Continue'} onPress={handleContinue} loading={submitting} />
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  resetLabel: {
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodySmall.fontSize),
    color: theme.colors.tertiary,
    textDecorationLine: 'underline',
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
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  sliderFlex: {
    flex: 1,
  },
  sliderEndLabel: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
  },
  sliderValueLabel: {
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodySmall.fontSize),
    textAlign: 'center',
    marginTop: theme.spacing.xs,
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
  micButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.input,
    borderWidth: 1.5,
    borderColor: theme.colors.tertiary,
    backgroundColor: theme.colors.background.orange,
  },
  micButtonListening: {
    backgroundColor: theme.colors.tertiary,
  },
  micLabel: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.tertiary,
  },
  micLabelListening: {
    color: '#FFFFFF',
  },
  voiceNote: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(theme.typography.caption.fontSize),
    color: theme.colors.neutral[600],
    marginTop: theme.spacing.sm,
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
  submitError: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(theme.typography.caption.fontSize),
    color: theme.colors.status.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
});

export default AccessibilityScreen;
