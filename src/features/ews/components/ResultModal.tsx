import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import { PrimaryButton } from '@/components/buttons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { responsiveFontSize } from '@/utils/responsive';
import type { Assessment } from '../lib/ewsService';
import { headline, overallShort } from '../lib/flow';
import { overallTone } from '../tone';
import { EwsSheet } from './EwsSheet';
import { ewsText } from './text';
import EstimateFlower from '../../../../assets/ews/estimate-flower.svg';

// Shown once the last answer is in — Figma "Quick Welbeing Score" pop-up
// (3344:324186): title, the smiling-flower illustration, a band chip, one line
// of copy, one CTA. "Here's the estimate" becomes "Here's your wellbeing
// picture"; the "LOW RISK" chip becomes the spec's overall band words (spec F
// bans "risk" language); "Unlock full 9 dimension profile / Not Now" becomes a
// single "View my wellbeing overview" — nothing is locked or paid.

type ResultModalProps = {
  assessment: Assessment | null;
  onView: () => void;
};

export const ResultModal: React.FC<ResultModalProps> = ({ assessment, onView }) => {
  const colors = useThemeColors();
  const result = assessment?.result;
  const tone = result ? overallTone(result.display, colors) : null;

  return (
    <EwsSheet visible={Boolean(result)} title="Here’s your wellbeing picture" blocking>
      {result && tone && (
        <>
          <View style={styles.center}>
            <EstimateFlower width={111} height={111} />
            <View style={[styles.chip, { backgroundColor: tone.bg }]}>
              <Text style={[styles.chipText, { color: tone.text }]}>{overallShort(result)}</Text>
            </View>
            <Text style={[ewsText.body, styles.text, { color: colors.text.secondary }]}>
              {headline(result, assessment?.proxy?.relationship)} This is a check-in, not a medical test.
            </Text>
          </View>
          <PrimaryButton label="View my wellbeing overview" onPress={onView} style={styles.cta} />
        </>
      )}
    </EwsSheet>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  chip: {
    borderRadius: 60,
    paddingHorizontal: 34,
    paddingVertical: theme.spacing.sm,
  },
  chipText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: responsiveFontSize(18),
    lineHeight: 24,
    textAlign: 'center',
  },
  text: {
    textAlign: 'center',
  },
  cta: {
    marginTop: theme.spacing.xxl,
    height: 50,
  },
});

export default ResultModal;
