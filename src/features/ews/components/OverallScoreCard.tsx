import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import { PrimaryButton, SecondaryButton } from '@/components/buttons';
import { useThemeColors } from '@/hooks/useThemeColors';
import type { Assessment } from '../lib/ewsService';
import { areaProfile, headline, overallShort } from '../lib/flow';
import { BANDS, DIMS } from '../lib/questionnaire';
import { dimTone, overallTone } from '../tone';
import { RadialScore } from './RadialScore';
import { ewsText } from './text';
import DimIconSmall from '../../../../assets/ews/dim-icon-small.svg';

// "Wellbeing Score" card — Figma 3344:322639. Shows the internal score as
// "N out of 100" (decided: numbers are shown, as on the web) with the band
// chip, the spec headline and the area profile beside it, so the number is
// never the only thing on screen. "Action needed on 5 of 9 dimensions"
// becomes the spec's area profile; "Retake full assessment" becomes "Retake".

export function relativeDay(isoDate: string): string {
  const days = Math.floor((Date.now() - new Date(`${isoDate}T00:00:00`).getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

type OverallScoreCardProps = {
  assessment: Assessment;
  onViewPlan: () => void;
  onRetake: () => void;
};

export const OverallScoreCard: React.FC<OverallScoreCardProps> = ({ assessment, onViewPlan, onRetake }) => {
  const colors = useThemeColors();
  const result = assessment.result!;
  const chip = overallTone(result.display, colors);
  // Figma lists the areas pulling the score down, lowest first.
  const lowest = DIMS.filter((d) => result.dims[d.id].score != null && result.dims[d.id].band !== 'going_well')
    .sort((a, b) => result.dims[a.id].score! - result.dims[b.id].score!)
    .slice(0, 4);

  return (
    <View style={[styles.card, { backgroundColor: colors.background.base }]}>
      <Text accessibilityRole="header" style={[ewsText.h3, { color: colors.text.secondary }]}>
        Wellbeing Score
      </Text>

      <View style={styles.chart}>
        <RadialScore result={result} />
        <Text style={[ewsText.h5, { color: colors.accentOrange }]}>
          {result.internal != null ? `${result.internal} out of 100` : 'Not enough answers'}
        </Text>
        <View style={[styles.chip, { backgroundColor: chip.bg }]}>
          <Text style={[ewsText.small, { color: chip.text }]}>{overallShort(result)}</Text>
        </View>
      </View>

      <View style={[styles.summary, { borderBottomColor: colors.border.hairline }]}>
        <Text style={[ewsText.bodyMd, styles.center, { color: colors.text.secondary }]}>{headline(result, assessment.proxy?.relationship)}</Text>
        <Text style={[ewsText.bodyMd, styles.center, { color: colors.text.secondary }]}>{areaProfile(result)}</Text>
        <Text style={[ewsText.italic, styles.center, { color: colors.text.muted }]}>Last assessed {relativeDay(assessment.completedOn!)}</Text>
      </View>

      {lowest.length > 0 && (
        <View style={styles.list}>
          {lowest.map((d) => {
            const r = result.dims[d.id];
            const tone = dimTone(r.band, colors);
            return (
              <View
                key={d.id}
                style={styles.row}
                accessible
                accessibilityLabel={`${d.name}: ${r.score} out of 100, ${BANDS[r.band].label}`}
              >
                <View style={styles.left}>
                  <DimIconSmall width={24} height={24} color={tone.fg} />
                  <View style={styles.flex}>
                    <Text style={[ewsText.body, { color: colors.text.secondary }]}>{d.short}</Text>
                    <Text style={[ewsText.small, { color: tone.chipText }]}>
                      {BANDS[r.band].mark} {BANDS[r.band].label}
                    </Text>
                  </View>
                </View>
                <Text style={[ewsText.h5, { color: tone.fg }]}>{r.score}</Text>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.buttons}>
        <PrimaryButton label="View Care Plan" onPress={onViewPlan} />
        <SecondaryButton label="Retake" onPress={onRetake} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.xxl,
  },
  chart: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  chip: {
    borderRadius: 60,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.xs,
  },
  summary: {
    gap: 2,
    paddingBottom: theme.spacing.xxl,
    borderBottomWidth: 1,
  },
  center: {
    textAlign: 'center',
  },
  list: {
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  flex: {
    flex: 1,
  },
  buttons: {
    gap: theme.spacing.lg,
  },
});

export default OverallScoreCard;
