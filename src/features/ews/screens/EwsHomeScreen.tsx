import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '@/theme';
import { Screen, Header } from '@/components/layouts';
import { DestructiveButton, HyperlinkButton, LightButton, PrimaryButton, SecondaryButton } from '@/components/buttons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { responsiveFontSize } from '@/utils/responsive';
import type { RootRouteProp, RootStackParamList } from '@/navigation/types';
import { useEws } from '../hooks/useEws';
import { deleteAssessment, startAssessment, type Assessment, type SafetyEvent, type StartInput } from '../lib/ewsService';
import { optionLabel, questionText } from '../lib/flow';
import { DIMS, DISCLAIMER, ITEMS, SAFETY, WHEN_PROFESSIONAL, WHEN_URGENT, type DimId } from '../lib/questionnaire';
import { AreaList } from '../components/AreaList';
import { CallbackSheet } from '../components/CallbackSheet';
import { EwsSheet } from '../components/EwsSheet';
import { OverallScoreCard } from '../components/OverallScoreCard';
import { SafetyModal } from '../components/SafetyModal';
import { ScoreTrend } from '../components/ScoreTrend';
import { SetupSheet } from '../components/SetupSheet';
import { ewsText } from '../components/text';
import BannerCard from '../../../../assets/ews/banner-card.svg';
import ChevronDown from '../../../../assets/ews/chevron-down.svg';
import DimIconSmall from '../../../../assets/ews/dim-icon-small.svg';

// "Elder Wellbeing" — decides between the two Figma states:
//   - no result yet → "Elder Wellbeing - New User" (3344:324209): banner,
//     illustration, intro and CTAs. "Take 2-min quick check" and "Start full
//     assessment" become one "Start my check-in" (the spec check-in takes about
//     10 minutes); an unfinished check-in becomes "Continue my check-in";
//   - has a result → "Elder Wellbeing Score" (3344:322637) and its expanded
//     state (3344:322837), with spec F's required content added: safety
//     support pinned at the top, "not a medical test" + who answered, when to
//     get help, the fixed disclaimer, See my answers and Delete. Figma's
//     "Specialist add-on assessment" cards (₹749 · Book now) are not built —
//     Serve Saathi is discovery-only.

type Nav = StackNavigationProp<RootStackParamList, 'EwsHome'>;

export const EwsHomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RootRouteProp<'EwsHome'>>();
  const colors = useThemeColors();
  const ews = useEws();
  const [setupOpen, setSetupOpen] = useState(false);

  // Home's "Start my check-in" lands here with the set-up pop-up open.
  useEffect(() => {
    if (route.params?.start) {
      setSetupOpen(true);
      navigation.setParams({ start: undefined });
    }
  }, [route.params?.start, navigation]);

  const start = async (input: StartInput) => {
    setSetupOpen(false);
    await startAssessment(ews.userId, input);
    navigation.navigate('EwsCheckIn');
  };

  const latest = ews.latest?.result ? ews.latest : null;

  return (
    <Screen scrollable contentContainerStyle={styles.scroll}>
      <Header title="Elder Wellbeing" />
      {ews.status === 'loading' ? (
        <ActivityIndicator style={styles.loading} color={colors.accentPrimary} />
      ) : latest ? (
        <Overview
          userId={ews.userId}
          latest={latest}
          history={ews.history}
          draft={ews.draft}
          onContinue={() => navigation.navigate('EwsCheckIn')}
          onRetake={() => setSetupOpen(true)}
          onViewPlan={() => navigation.navigate('EwsPlan')}
          onExploreServices={() => navigation.navigate('Home', { screen: 'ServiceTab' })}
          onDeleted={ews.refresh}
        />
      ) : (
        <NewUser
          draft={ews.draft}
          onStart={() => setSetupOpen(true)}
          onContinue={() => navigation.navigate('EwsCheckIn')}
          onExplore={() => navigation.navigate('EwsExplore')}
        />
      )}
      <SetupSheet visible={setupOpen} onClose={() => setSetupOpen(false)} onStart={start} />
    </Screen>
  );
};

/** "N of 8 areas done · saved for 7 days" under Continue. */
export const draftProgress = (draft: Assessment) =>
  `${Math.min(draft.progress.dimIdx, DIMS.length)} of ${DIMS.length} areas done · saved for 7 days`;

function NewUser({
  draft,
  onStart,
  onContinue,
  onExplore,
}: {
  draft: Assessment | null;
  onStart: () => void;
  onContinue: () => void;
  onExplore: () => void;
}) {
  const colors = useThemeColors();
  return (
    <View style={styles.body}>
      <View style={[styles.banner, { backgroundColor: colors.accentPrimary }]}>
        <View style={styles.bannerArt} pointerEvents="none">
          <BannerCard width={312} height={100} color={colors.accentPrimary} />
        </View>
        <Text style={[ewsText.body, { color: '#FFFFFF' }]}>Check up for the whole picture</Text>
        <Text style={[styles.bannerTitle, { color: '#FFFFFF' }]}>Care for your parents, before a crisis, not after.</Text>
      </View>

      <View style={styles.center}>
        <Image source={require('../../../../assets/ews/senior-parent.png')} style={styles.art} resizeMode="contain" accessibilityIgnoresInvertColors />
        <Text style={[ewsText.body, styles.centerText, { color: colors.text.secondary }]}>
          Most families find out something’s wrong only after a fall or a bad week. Serve Saathi’s check-in looks at eight areas of an
          elder’s wellbeing and shows which ones could use support.
        </Text>
      </View>

      <View style={styles.ctas}>
        {draft ? (
          <>
            <PrimaryButton label="Continue my check-in" onPress={onContinue} />
            <Text style={[ewsText.small, styles.centerText, { color: colors.text.tertiary }]}>{draftProgress(draft)}</Text>
            <SecondaryButton label="Start again" onPress={onStart} />
          </>
        ) : (
          <PrimaryButton label="Start my check-in" onPress={onStart} />
        )}
        <LightButton label="Explore Elder Wellbeing" onPress={onExplore} />
      </View>
    </View>
  );
}

function Overview({
  userId,
  latest,
  history,
  draft,
  onContinue,
  onRetake,
  onViewPlan,
  onExploreServices,
  onDeleted,
}: {
  userId: string;
  latest: Assessment;
  history: Assessment[];
  draft: Assessment | null;
  onContinue: () => void;
  onRetake: () => void;
  onViewPlan: () => void;
  onExploreServices: () => void;
  onDeleted: () => void;
}) {
  const colors = useThemeColors();
  const result = latest.result!;
  const [reopened, setReopened] = useState<SafetyEvent | null>(null);
  const [callbackDim, setCallbackDim] = useState<DimId | null>(null);
  const [answersOpen, setAnswersOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const shown = latest.events.filter((e) => e.tier <= 2);
  const answeredBy = latest.proxy ? `your ${latest.proxy.relationship}, about ${latest.proxy.elderName}` : 'you';
  const completed = new Date(`${latest.completedOn}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <View style={styles.body}>
      <Text style={[ewsText.small, { color: colors.text.tertiary }]}>
        This is a check-in, not a medical test. Completed {completed} · Answered by {answeredBy}
      </Text>

      {draft && (
        <View style={[styles.card, { backgroundColor: colors.background.base }]}>
          <Text style={[ewsText.h5, { color: colors.text.primary }]}>You have an unfinished check-in</Text>
          <PrimaryButton label="Continue my check-in" onPress={onContinue} />
          <Text style={[ewsText.small, { color: colors.text.tertiary }]}>{draftProgress(draft)}</Text>
        </View>
      )}

      {shown.length > 0 && (
        <View style={[styles.support, { backgroundColor: colors.background.orange, borderLeftColor: colors.accentOrange }]}>
          <Text accessibilityRole="header" style={[ewsText.h5, { color: colors.text.primary }]}>
            Support information shown during your check-in
          </Text>
          {shown.map((e) => (
            <View key={e.key} style={styles.supportRow}>
              <Text style={[ewsText.body, styles.flex, { color: colors.text.secondary }]}>{SAFETY[e.id].short}</Text>
              <HyperlinkButton label="See again" textColor={colors.accentPrimary} onPress={() => setReopened(e)} />
            </View>
          ))}
        </View>
      )}

      <OverallScoreCard assessment={latest} onViewPlan={onViewPlan} onRetake={onRetake} />
      <ScoreTrend history={history} />

      <View style={styles.section}>
        <Text accessibilityRole="header" style={[ewsText.h2, { color: colors.text.primary }]}>
          Eight areas, one picture
        </Text>
        <Text style={[ewsText.body, { color: colors.text.secondary }]}>Expand an area to see what we noticed and where to find support.</Text>
      </View>
      <AreaList result={result} onExploreServices={onExploreServices} onRequestCallback={setCallbackDim} />

      <View style={styles.section}>
        <Expandable title="When to talk to a professional" text={WHEN_PROFESSIONAL} />
        <Expandable title="When to get urgent help" text={WHEN_URGENT} />
      </View>

      <View style={styles.section}>
        <LightButton label="See my answers" onPress={() => setAnswersOpen(true)} />
        <HyperlinkButton label="Delete this check-in" textColor={colors.error} onPress={() => setConfirmDelete(true)} />
      </View>

      <Text style={[ewsText.small, styles.disclaimer, { color: colors.text.tertiary, borderTopColor: colors.border.hairline }]}>{DISCLAIMER}</Text>

      <SafetyModal event={reopened} mode={latest.mode} context="results" onAction={() => undefined} onContinue={() => setReopened(null)} />
      <CallbackSheet visible={callbackDim !== null} onClose={() => setCallbackDim(null)} category="area_support" dim={callbackDim ?? undefined} />

      <EwsSheet visible={answersOpen} title="See my answers" onClose={() => setAnswersOpen(false)}>
        <AnswersList assessment={latest} />
      </EwsSheet>

      <EwsSheet visible={confirmDelete} title="Delete this check-in?" onClose={() => setConfirmDelete(false)}>
        <Text style={[ewsText.body, { color: colors.text.secondary }]}>
          Your answers and results from {completed} will be removed. This can’t be undone.
        </Text>
        <DestructiveButton
          label="Delete"
          onPress={async () => {
            await deleteAssessment(userId, latest.id);
            setConfirmDelete(false);
            onDeleted();
          }}
        />
        <SecondaryButton label="Keep it" onPress={() => setConfirmDelete(false)} />
      </EwsSheet>
    </View>
  );
}

function Expandable({ title, text }: { title: string; text: string }) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(false);
  return (
    <View style={[styles.card, { backgroundColor: colors.background.base }]}>
      <Pressable
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setOpen((o) => !o);
        }}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.expandHead}
      >
        <Text style={[ewsText.h5, styles.flex, { color: colors.text.primary }]}>{title}</Text>
        <View style={open && styles.flip}>
          <ChevronDown width={22} height={22} color={colors.text.primary} />
        </View>
      </Pressable>
      {open && <Text style={[ewsText.body, { color: colors.text.secondary }]}>{text}</Text>}
    </View>
  );
}

function AnswersList({ assessment }: { assessment: Assessment }) {
  const colors = useThemeColors();
  const elderName = assessment.proxy?.elderName ?? '';
  const rows = ITEMS.filter((i) => assessment.answers[i.id] !== undefined);
  return (
    <>
      <View style={[styles.card, styles.noteRow, { backgroundColor: colors.background.base }]}>
        <DimIconSmall width={24} height={24} color={colors.accentOrange} />
        <Text style={[ewsText.small, styles.flex, { color: colors.text.secondary }]}>Private answers are never shown back — not even to you.</Text>
      </View>
      {rows.map((i) => (
        <View key={i.id} style={[styles.answer, { borderBottomColor: colors.border.hairline }]}>
          <Text style={[ewsText.small, { color: colors.text.tertiary }]}>{questionText(i, assessment.mode, elderName)}</Text>
          <Text style={[ewsText.h5, { color: colors.text.primary }]}>{optionLabel(i, assessment.answers[i.id], assessment.mode)}</Text>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: theme.spacing.xxxxl,
  },
  loading: {
    marginTop: theme.spacing.xxxxl,
  },
  body: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.xxl,
    gap: theme.spacing.xxl,
  },
  banner: {
    minHeight: 100,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
    justifyContent: 'center',
  },
  bannerArt: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  bannerTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: responsiveFontSize(20),
    lineHeight: 24,
  },
  center: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  art: {
    width: 240,
    height: 196,
  },
  centerText: {
    textAlign: 'center',
  },
  ctas: {
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  card: {
    borderRadius: theme.radius.sm,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  support: {
    borderRadius: theme.radius.sm,
    borderLeftWidth: 4,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  flex: {
    flex: 1,
  },
  section: {
    gap: theme.spacing.sm,
  },
  flip: {
    transform: [{ rotate: '180deg' }],
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  disclaimer: {
    borderTopWidth: 1.5,
    paddingTop: theme.spacing.xxl,
  },
  answer: {
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
  },
});

export default EwsHomeScreen;
