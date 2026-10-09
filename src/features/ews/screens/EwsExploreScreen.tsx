import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '@/theme';
import { Screen, Header } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { responsiveFontSize } from '@/utils/responsive';
import type { RootStackParamList } from '@/navigation/types';
import { BANDS, DIMS, DISCLAIMER, type DimId } from '../lib/questionnaire';
import { DIM_CLOSER_LOOK, DIM_GOING_WELL } from '../lib/scoring';
import { dimTone } from '../tone';
import { ewsText } from '../components/text';
import DimIcon from '../../../../assets/ews/dim-icon.svg';
import DimIconSmall from '../../../../assets/ews/dim-icon-small.svg';

// "Elder Wellbeing - Explore" — Figma 3344:324391, built with spec-safe copy
// (decided with the user): the layout is Figma's (illustration, intro, one
// card per area, the "not a quiz" list, how-to-read-results, the dark CTA
// band) but
//   - eight spec areas, not nine (no "Physical Health & Mobility");
//   - no "weighted average", "critical range" or "serious fall risk" — the
//     overall is a simple average and results use the spec's band words;
//   - no unverifiable claims ("1200+ families", "4.85 out of 5", "a
//     coordinator calls within 24 hours") and no sample report with made-up
//     numbers;
//   - one "Start my check-in" CTA instead of quick check + full assessment.

// Figma's card descriptions, kept where they describe a spec area; Nutrition
// has no Figma card, so its line is written in the same style.
const ABOUT: Record<DimId, string> = {
  ADL: 'Independence in the tasks that make up a self-sufficient day.',
  NUT: 'Whether meals and water keep up with what the body needs.',
  MED: 'Whether medicines are taken correctly, on time, every time.',
  HOM: 'The hazards hiding in a home that was designed decades ago, and whether help can be reached.',
  SOC: 'Contact with family, friends and the world outside the house.',
  COG: 'Early signs in memory, orientation and everyday decision making.',
  EMO: 'Mood, motivation and the quiet loneliness families often miss.',
  FIN: 'Paperwork and arrangements ready before a crisis forces the question.',
};

type Nav = StackNavigationProp<RootStackParamList, 'EwsExplore'>;

export const EwsExploreScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const colors = useThemeColors();
  const start = () => navigation.navigate('EwsHome', { start: true });

  const bands: { band: 'going_well' | 'closer_look' | 'needs_attention'; range: string }[] = [
    { band: 'going_well', range: `${DIM_GOING_WELL}–100` },
    { band: 'closer_look', range: `${DIM_CLOSER_LOOK}–${DIM_GOING_WELL - 1}` },
    { band: 'needs_attention', range: `0–${DIM_CLOSER_LOOK - 1}` },
  ];

  return (
    <Screen scrollable contentContainerStyle={styles.scroll}>
      <Header title="Elder Wellbeing" />
      <View style={styles.body}>
        <View style={styles.center}>
          <Image source={require('../../../../assets/ews/senior-parent.png')} style={styles.art} resizeMode="contain" accessibilityIgnoresInvertColors />
        </View>

        <View style={styles.section}>
          <Text accessibilityRole="header" style={[ewsText.h2, { color: colors.text.primary }]}>
            Eight areas, one picture
          </Text>
          <Text style={[ewsText.body, { color: colors.text.secondary }]}>
            Elder wellbeing is not captured by a single number in a lab report. It is the sum of how someone eats, takes their
            medicines, gets through the day, stays safe at home, keeps in touch, remembers, feels and keeps their papers in order. The
            check-in asks about all eight.
          </Text>
        </View>

        <View style={styles.cards}>
          {DIMS.map((d) => (
            <View key={d.id} style={[styles.card, { backgroundColor: colors.background.base }]}>
              <View style={[styles.tab, { backgroundColor: colors.accentOrangeSurface }]}>
                <DimIcon width={30} height={30} color={colors.accentOrange} />
              </View>
              <Text style={[ewsText.h5, { color: colors.text.secondary }]}>{d.name}</Text>
              <Text style={[ewsText.bodyMd, { color: colors.text.secondary }]}>{ABOUT[d.id]}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text accessibilityRole="header" style={[ewsText.h2, { color: colors.text.primary }]}>
            A check-in, not a test
          </Text>
          <Text style={[ewsText.body, { color: colors.text.secondary }]}>{DISCLAIMER}</Text>
          {['About 10 minutes, at your own pace', 'Skip any question, stop any time', 'Your answers are seen only by you unless you share'].map((t) => (
            <View key={t} style={styles.point}>
              <DimIconSmall width={24} height={24} color={colors.accentOrange} />
              <Text style={[ewsText.body, styles.flex, { color: colors.text.secondary }]}>{t}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, styles.read, { backgroundColor: colors.background.base }]}>
          <Text accessibilityRole="header" style={[ewsText.h3, { color: colors.text.primary }]}>
            How to read your results
          </Text>
          <Text style={[ewsText.body, { color: colors.text.secondary }]}>
            Each area gets a score out of 100 and a band. Your overall picture is the average of the areas, shown with the same
            words. A word and a symbol always sit beside each number.
          </Text>
          <View style={styles.bands}>
            {bands.map(({ band, range }) => {
              const tone = dimTone(band, colors);
              return (
                <View key={band} style={[styles.band, { backgroundColor: tone.chipBg }]}>
                  <Text style={[ewsText.h5, { color: tone.chipText }]}>
                    {BANDS[band].mark} {BANDS[band].label}
                  </Text>
                  <Text style={[ewsText.small, { color: tone.chipText }]}>{range}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.cta, { backgroundColor: colors.secondarySurface }]}>
          <Text style={[styles.ctaTitle, { color: colors.textInverse }]}>Peace of mind starts with knowing where things stand.</Text>
          <Text style={[ewsText.body, styles.centerText, { color: colors.textInverse }]}>
            Take the free check-in today and see a picture of eight areas, with next steps for each.
          </Text>
          <PrimaryButton label="Start my check-in" onPress={start} />
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: theme.spacing.xxxxl,
  },
  body: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.xxl,
    gap: theme.spacing.xxl,
  },
  center: {
    alignItems: 'center',
  },
  art: {
    width: 240,
    height: 196,
  },
  section: {
    gap: theme.spacing.sm,
  },
  cards: {
    gap: theme.spacing.xl,
  },
  card: {
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  tab: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: theme.radius.sm,
    borderTopRightRadius: theme.radius.sm,
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
    marginBottom: theme.spacing.xs,
  },
  point: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  flex: {
    flex: 1,
  },
  read: {
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  bands: {
    gap: theme.spacing.sm,
  },
  band: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  cta: {
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.xxxl,
    gap: theme.spacing.lg,
    alignItems: 'stretch',
  },
  ctaTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: responsiveFontSize(26),
    lineHeight: 34,
    textAlign: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
});

export default EwsExploreScreen;
