import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Mic } from 'lucide-react-native';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { ToggleSwitch } from '@/components/inputs';
import { responsiveFontSize } from '@/utils/responsive';
import { masterdataService, careProfileService, getErrorMessage, type MasterDataOption } from '@/api';
import { useAccessibilityStore, type FontSizeLevel } from '@/store/accessibility.store';
import { useVoiceCommands, type VoiceCommand } from '@/hooks/useVoiceCommands';
import { speak } from '@/services/voice';

// "Profile Creation 6a" (Figma 1248:44362) — step 6 of 6: Accessibility preferences.
// Choices are applied live app-wide (global Text patch reads the accessibility
// store) and persisted to the backend care profile on Continue.
const FONT_PREVIEW_SIZES: Record<FontSizeLevel, number> = { 0: 14, 1: 16, 2: 19 };
const FONT_LABELS: Record<FontSizeLevel, string> = { 0: 'small', 1: 'medium', 2: 'large' };
// Backend fontSize is 1 (smallest) … 5 (largest); the 3-stop slider maps onto its ends/middle.
const API_FONT_SIZE: Record<FontSizeLevel, number> = { 0: 1, 1: 3, 2: 5 };

const VOICE_HELP =
  'You can say: bigger text, smaller text, high contrast, normal contrast, or continue.';

export const AccessibilityScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'ProfileAccessibility'>>();
  const fontSize = useAccessibilityStore((s) => s.fontSizeLevel);
  const setFontSize = useAccessibilityStore((s) => s.setFontSizeLevel);
  const highContrast = useAccessibilityStore((s) => s.highContrast);
  const setHighContrast = useAccessibilityStore((s) => s.setHighContrast);
  const voiceCommands = useAccessibilityStore((s) => s.voiceCommandsEnabled);
  const setVoiceCommands = useAccessibilityStore((s) => s.setVoiceCommandsEnabled);
  const [contrastOptions, setContrastOptions] = useState<MasterDataOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    masterdataService
      .getColorContrasts()
      .then(setContrastOptions)
      .catch(() => setContrastOptions([]));
  }, []);

  const changeFontSize = (level: FontSizeLevel) => {
    setFontSize(level);
    if (voiceCommands) speak(`Font size ${FONT_LABELS[level]}.`);
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
        fontSize: API_FONT_SIZE[fontSize],
        voiceCommandsEnabled: voiceCommands,
        ...(contrastOption ? { colorContrastId: Number(contrastOption.id) } : {}),
      });
      // Figma flow: Accessibility → Subscription → Payment method → Setting up
      navigation.navigate('Subscription');
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
      case 'fontUp':
        changeFontSize(Math.min(2, fontSize + 1) as FontSizeLevel);
        break;
      case 'fontDown':
        changeFontSize(Math.max(0, fontSize - 1) as FontSizeLevel);
        break;
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
    <Screen scrollable statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content">
      <Header leftIcon="back" transparent stepper={{ current: 6, total: 6 }} />

      <View style={styles.content}>
        <Spacer size="lg" />
        <Text style={styles.title} accessibilityRole="header">
          Accessibility
        </Text>
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
              onPress={() => changeFontSize(stop as FontSizeLevel)}
              hitSlop={16}
              style={styles.stopTouch}
              accessibilityRole="button"
              accessibilityLabel={`${FONT_LABELS[stop as FontSizeLevel]} font size`}
              accessibilityState={{ selected: fontSize === stop }}
            >
              {fontSize === stop && <View style={styles.thumb} />}
            </Pressable>
          ))}
        </View>
        <View style={styles.sliderLabels}>
          {([0, 1, 2] as FontSizeLevel[]).map((stop) => (
            <Pressable key={stop} onPress={() => changeFontSize(stop)} hitSlop={12}>
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
          <ToggleSwitch value={voiceCommands} onValueChange={handleVoiceToggle} color="orange" />
        </View>

        {voiceCommands && voice.available && (
          <>
            <Spacer size="sm" />
            <Pressable
              onPress={voice.listening ? voice.stopVoiceInput : voice.startVoiceInput}
              style={[styles.micButton, voice.listening && styles.micButtonListening]}
              accessibilityRole="button"
              accessibilityLabel={voice.listening ? 'Stop listening' : 'Speak a command'}
              accessibilityHint={VOICE_HELP}
            >
              <Mic size={22} color={voice.listening ? '#FFFFFF' : theme.colors.tertiary} />
              <Text style={[styles.micLabel, voice.listening && styles.micLabelListening]}>
                {voice.listening ? 'Listening…' : 'Tap to speak a command'}
              </Text>
            </Pressable>
          </>
        )}
        {voiceCommands && !voice.available && (
          <Text style={styles.voiceNote}>
            Voice input needs the full ServeSaathi app build. Voice guidance will still read your
            changes aloud.
          </Text>
        )}

        <Spacer size="sm" />
        <Text style={styles.toggleLabel}>Color contrast</Text>
        <Spacer size="md" />

        <View style={styles.contrastRow}>
          <Pressable
            onPress={() => changeContrast(false)}
            style={[styles.contrastCard, !highContrast && styles.contrastCardActive]}
            accessibilityRole="button"
            accessibilityLabel="Normal contrast"
            accessibilityState={{ selected: !highContrast }}
          >
            <View style={styles.contrastSwatchNormal} />
            <Spacer size="md" />
            <Text style={styles.contrastLabel}>Normal</Text>
          </Pressable>
          <Pressable
            onPress={() => changeContrast(true)}
            style={[styles.contrastCard, highContrast && styles.contrastCardActive]}
            accessibilityRole="button"
            accessibilityLabel="High contrast"
            accessibilityState={{ selected: highContrast }}
          >
            <View style={styles.contrastSwatchHigh} />
            <Spacer size="md" />
            <Text style={styles.contrastLabel}>High contrast</Text>
          </Pressable>
        </View>

        <Spacer size="xxl" />
        <View style={styles.footer}>
          {submitError && <Text style={styles.submitError}>{submitError}</Text>}
          <PrimaryButton label="Continue" onPress={handleContinue} loading={submitting} />
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
