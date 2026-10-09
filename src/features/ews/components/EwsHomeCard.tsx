import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '@/theme';
import { HyperlinkButton, PrimaryButton, SecondaryButton } from '@/components/buttons';
import { useThemeColors } from '@/hooks/useThemeColors';
import type { RootStackParamList } from '@/navigation/types';
import { useEws } from '../hooks/useEws';
import { areaProfile, overallShort } from '../lib/flow';
import { DIMS } from '../lib/questionnaire';
import { overallTone } from '../tone';
import { relativeDay } from './OverallScoreCard';
import { RadialScore } from './RadialScore';
import { ewsText } from './text';

// Home's "Wellbeing" card — Figma "Hub" (3344:324314). Three states:
//   - has a result: the radial chart, "N out of 100", band chip, area profile
//     and "Last assessed", with View my wellbeing / Retake;
//   - unfinished check-in: "Continue my check-in · N of 8 areas done · saved
//     for 7 days";
//   - nothing yet: "You don't have a scorecard yet" + "Start my check-in".

type Nav = StackNavigationProp<RootStackParamList>;

export const EwsHomeCard: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const colors = useThemeColors();
  const ews = useEws();
  const latest = ews.latest?.result ? ews.latest : null;

  return (
    <View style={[styles.card, { backgroundColor: colors.background.base }]}>
      <Text accessibilityRole="header" style={[ewsText.h5, { color: colors.text.secondary }]}>
        Wellbeing
      </Text>

      {ews.status === 'loading' ? (
        <ActivityIndicator color={colors.accentPrimary} />
      ) : latest ? (
        <>
          <View style={styles.chart}>
            <RadialScore result={latest.result!} />
            <Text style={[ewsText.h5, { color: colors.accentOrange }]}>
              {latest.result!.internal != null ? `${latest.result!.internal} out of 100` : 'Not enough answers'}
            </Text>
            <View style={[styles.chip, { backgroundColor: overallTone(latest.result!.display, colors).bg }]}>
              <Text style={[ewsText.small, { color: overallTone(latest.result!.display, colors).text }]}>{overallShort(latest.result!)}</Text>
            </View>
          </View>
          <View style={[styles.summary, { borderBottomColor: colors.border.hairline }]}>
            <Text style={[ewsText.bodyMd, styles.center, { color: colors.text.secondary }]}>{areaProfile(latest.result!)}</Text>
            <Text style={[ewsText.italic, styles.center, { color: colors.text.muted }]}>Last assessed {relativeDay(latest.completedOn!)}</Text>
          </View>
          {ews.draft && (
            <>
              <PrimaryButton label="Continue my check-in" onPress={() => navigation.navigate('EwsCheckIn')} />
              <Text style={[ewsText.small, styles.center, { color: colors.text.tertiary }]}>
                {Math.min(ews.draft.progress.dimIdx, DIMS.length)} of {DIMS.length} areas done · saved for 7 days
              </Text>
            </>
          )}
          <View style={styles.buttons}>
            <PrimaryButton label="View my wellbeing" onPress={() => navigation.navigate('EwsHome')} />
            <SecondaryButton label="Retake" onPress={() => navigation.navigate('EwsHome', { start: true })} />
          </View>
        </>
      ) : ews.draft ? (
        <>
          <Text style={[ewsText.h3, styles.center, { color: colors.text.primary }]}>You don’t have a scorecard yet</Text>
          <Text style={[ewsText.bodyMd, styles.center, { color: colors.text.secondary }]}>Pick up where you left off.</Text>
          <PrimaryButton label="Continue my check-in" onPress={() => navigation.navigate('EwsCheckIn')} />
          <Text style={[ewsText.small, styles.center, { color: colors.text.tertiary }]}>
            {Math.min(ews.draft.progress.dimIdx, DIMS.length)} of {DIMS.length} areas done · saved for 7 days
          </Text>
        </>
      ) : (
        <>
          <Text style={[ewsText.h3, styles.center, { color: colors.text.primary }]}>You don’t have a scorecard yet</Text>
          <Text style={[ewsText.bodyMd, styles.center, { color: colors.text.secondary }]}>
            A 10-minute check-in across eight areas shows what’s going well and where support might help.
          </Text>
          <PrimaryButton label="Start my check-in" onPress={() => navigation.navigate('EwsHome', { start: true })} />
          <HyperlinkButton label="Explore Elder Wellbeing" textColor={colors.accentPrimary} onPress={() => navigation.navigate('EwsExplore')} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
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
  buttons: {
    gap: theme.spacing.md,
  },
});

export default EwsHomeCard;
