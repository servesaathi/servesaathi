import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/theme';
import { IconButton, PrimaryButton, SecondaryButton } from '@/components/buttons';
import { useThemeColors } from '@/hooks/useThemeColors';
import type { RootStackParamList } from '@/navigation/types';
import {
  completeAssessment,
  getInProgress,
  saveProgress,
  saveResponse,
  type Assessment,
  type Progress,
  type SafetyEvent,
  type SafetyUserAction,
} from '../lib/ewsService';
import { dimItems, extraChoice, optionLabel, questionText, s8Applies, triggerFor, type FlowContext } from '../lib/flow';
import { DIMS, SAFETY, type Answers, type Item, type SafetyId } from '../lib/questionnaire';
import { useEwsUserId } from '../hooks/useEws';
import { ChoiceCard } from '../components/ChoiceCard';
import { NavButtons } from '../components/NavButtons';
import { ResultModal } from '../components/ResultModal';
import { SafetyModal } from '../components/SafetyModal';
import { StepBar } from '../components/StepBar';
import { ewsText } from '../components/text';
import DimIconSmall from '../../../../assets/ews/dim-icon-small.svg';

// One question per screen — Figma "Full Assestment 1–9" (3344:323312 …): a
// pop-up sheet over the dimmed app, headline bar with the close button,
// segmented progress by area, the area name, the question as an H4, select
// cards, Back / Continue. Figma's 9 placeholder questions are replaced by the
// spec's 8 areas (~26 questions); the close button is "Save & Exit". Flow
// logic is the website's CheckIn.tsx (demo goQuestion()/commit()/endDim()).
//
// Privacy: EMO4/HOM4/…P answers and FIN3 live only in `privateAnswers`
// (component memory) for Back and show rules; ewsService never stores the
// first four and keeps FIN3 in its own restricted key. `jitSeen` is saved
// stripped, so "which private notices were seen" never reaches storage.

type Screen = 'intro' | 'question' | 'jit' | 'saved';
type OpenSafety = { key: string; returnTo: 'question' | 'endDim' };
type Nav = StackNavigationProp<RootStackParamList, 'EwsCheckIn'>;

export const EwsCheckInScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const userId = useEwsUserId();
  const [initial, setInitial] = useState<Assessment | null | undefined>(undefined);

  useEffect(() => {
    getInProgress(userId).then((draft) => {
      if (draft) setInitial(draft);
      else navigation.replace('EwsHome');
    });
  }, [userId, navigation]);

  if (!initial) return <Shell title="Wellbeing check-in" loading />;
  return <CheckIn key={initial.id} userId={userId} initial={initial} />;
};

function CheckIn({ userId, initial }: { userId: string; initial: Assessment }) {
  const navigation = useNavigation<Nav>();
  const colors = useThemeColors();
  const { mode, privateConfirmed, proxy } = initial;
  const elderName = proxy?.elderName ?? '';

  const [answers, setAnswers] = useState<Answers>(initial.answers);
  const [privateAnswers, setPrivateAnswers] = useState<Answers>({});
  const [progress, setProgress] = useState<Progress>(initial.progress);
  const [events, setEventsState] = useState<SafetyEvent[]>(initial.events);
  // Mirror so completion saves the very latest safety actions, including the
  // one recorded in the same tap that finishes the check-in.
  const eventsRef = useRef(events);
  const setEvents = useCallback((fn: (prev: SafetyEvent[]) => SafetyEvent[]) => {
    eventsRef.current = fn(eventsRef.current);
    setEventsState(eventsRef.current);
  }, []);
  const [screen, setScreen] = useState<Screen>('intro');
  const [selected, setSelected] = useState<string | null>(null);
  const [openSafety, setOpenSafety] = useState<OpenSafety | null>(null);
  const [completed, setCompleted] = useState<Assessment | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const all: Answers = { ...answers, ...privateAnswers };
  const ctxFor = (a: Answers): FlowContext => ({ mode, privateOk: privateConfirmed, answers: a });
  const ctx = ctxFor(all);
  const dim = DIMS[Math.min(progress.dimIdx, DIMS.length - 1)];
  const list = dimItems(dim.id, ctx);
  const item: Item | undefined = list[progress.qIdx];

  // Persist position + safety events after every step so the check-in can be
  // resumed for 7 days.
  useEffect(() => {
    if (!completed) saveProgress(userId, initial.id, progress, events);
  }, [userId, initial.id, progress, events, completed]);

  // Each new screen starts at the top (one question per screen).
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [screen, progress.dimIdx, progress.qIdx]);

  const fire = useCallback(
    (id: SafetyId): SafetyEvent => {
      const event: SafetyEvent = { key: `${id}-${Date.now()}`, id, tier: SAFETY[id].tier, at: new Date().toISOString(), mode, actions: [], share: false };
      setEvents((prev) => [...prev, event]);
      return event;
    },
    [mode, setEvents]
  );

  /** `nextAll`: standard + private answers as of this step. */
  const showQuestion = (p: Progress, nextAll: Answers = all) => {
    const next = dimItems(DIMS[p.dimIdx].id, ctxFor(nextAll))[p.qIdx];
    if (!next) return endDim(p, nextAll);
    setProgress(p);
    setSelected(nextAll[next.id] ?? null);
    setScreen(next.jit && !p.jitSeen.includes(next.id) ? 'jit' : 'question');
  };

  const endDim = async (p: Progress, nextAll: Answers): Promise<void> => {
    if (p.pending.length) {
      const [key, ...rest] = p.pending;
      setProgress({ ...p, pending: rest });
      setOpenSafety({ key, returnTo: 'endDim' });
      return;
    }
    if (p.dimIdx === DIMS.length - 1) {
      if (!p.s8Checked) {
        const checked = { ...p, s8Checked: true };
        if (s8Applies(nextAll)) {
          const ev = fire('S8');
          return endDim({ ...checked, pending: [ev.key] }, nextAll);
        }
        return endDim(checked, nextAll);
      }
      setProgress(p);
      await saveProgress(userId, initial.id, p, eventsRef.current);
      setCompleted(await completeAssessment(userId, initial.id));
      return;
    }
    setProgress({ ...p, dimIdx: p.dimIdx + 1, qIdx: 0 });
    setScreen('intro');
  };

  const commit = async (code: string) => {
    if (!item) return;
    if (item.restricted || item.restrictedStore) setPrivateAnswers((prev) => ({ ...prev, [item.id]: code }));
    else setAnswers((prev) => ({ ...prev, [item.id]: code }));
    const nextAll = { ...all, [item.id]: code };
    await saveResponse(userId, initial.id, item.id, code);

    const next: Progress = { ...progress, qIdx: progress.qIdx + 1 };
    const trigger = triggerFor(item, code);
    if (trigger) {
      const ev = fire(trigger);
      if (SAFETY[trigger].tier === 2) return showQuestion({ ...next, pending: [...next.pending, ev.key] }, nextAll);
      setProgress(next);
      setOpenSafety({ key: ev.key, returnTo: 'question' });
      return;
    }
    showQuestion(next, nextAll);
  };

  const back = () => {
    const target = progress.qIdx - 1;
    if (target < 0) return setScreen('intro');
    setProgress({ ...progress, qIdx: target });
    setSelected(all[list[target].id] ?? null);
    setScreen('question');
  };

  const introBack = () => {
    if (progress.dimIdx === 0) return;
    const prevList = dimItems(DIMS[progress.dimIdx - 1].id, ctx);
    const last = prevList[prevList.length - 1];
    setProgress({ ...progress, dimIdx: progress.dimIdx - 1, qIdx: prevList.length - 1 });
    setSelected(all[last.id] ?? null);
    setScreen('question');
  };

  const saveAndExit = () => {
    setOpenSafety(null);
    setScreen('saved');
  };
  const leave = () => navigation.navigate('EwsHome');

  // Android back = Save & Exit (never silently drops the check-in). While a
  // Tier 1 card is open, SafetyModal swallows the back press first.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (completed) return true;
      if (screen === 'saved') leave();
      else saveAndExit();
      return true;
    });
    return () => sub.remove();
  });

  const recordAction = (action: SafetyUserAction) => {
    if (!openSafety) return;
    setEvents((prev) => prev.map((e) => (e.key === openSafety.key ? { ...e, actions: [...e.actions, action] } : e)));
  };

  const closeSafety = () => {
    if (!openSafety) return;
    const { key, returnTo } = openSafety;
    setEvents((prev) => prev.map((e) => (e.key === key && e.actions.length === 0 ? { ...e, actions: ['dismissed'] } : e)));
    setOpenSafety(null);
    if (returnTo === 'endDim') endDim(progress, all);
    else showQuestion(progress);
  };

  const safetyEvent = openSafety ? events.find((e) => e.key === openSafety.key) ?? null : null;
  const doneAreas = Math.min(progress.dimIdx, DIMS.length);
  const extra = item ? extraChoice(item, mode) : null;
  const p = [ewsText.body, { color: colors.text.secondary }];

  let body: React.ReactNode = null;
  let footer: React.ReactNode = null;

  if (screen === 'intro') {
    body = (
      <>
        <Text style={[ewsText.h5, { color: colors.accentOrange }]}>
          Area {progress.dimIdx + 1} of {DIMS.length}
        </Text>
        <Text accessibilityRole="header" style={[ewsText.h2, { color: colors.text.primary }]}>
          {dim.name}
        </Text>
        <Text style={p}>A few short questions about {proxy ? dim.about.replace('you have', 'they have') : dim.about}.</Text>
        {dim.personal && (
          <View style={[styles.note, styles.noteRow, { backgroundColor: colors.background.base, borderColor: colors.border.hairline }]}>
            <DimIconSmall width={24} height={24} color={colors.accentOrange} />
            <Text style={[p, styles.flex]}>
              The next questions are personal. Some answers are private: never shown to family members and not included in any
              report. You can skip them.
            </Text>
          </View>
        )}
      </>
    );
    footer =
      progress.dimIdx > 0 ? (
        <NavButtons onBack={introBack} onNext={() => showQuestion({ ...progress, qIdx: 0 })} nextLabel="Let’s go" />
      ) : (
        <PrimaryButton label="Let’s go" onPress={() => showQuestion({ ...progress, qIdx: 0 })} />
      );
  } else if (screen === 'jit' && item) {
    body = (
      <>
        <Text style={[ewsText.small, { color: colors.text.secondary }]}>{dim.name}</Text>
        <View style={styles.noteRow}>
          <DimIconSmall width={24} height={24} color={colors.accentOrange} />
          <Text accessibilityRole="header" style={[ewsText.h2, styles.flex, { color: colors.text.primary }]}>
            The next question is personal.
          </Text>
        </View>
        <Text style={p}>Your answer is private: it is never shown to family members and is not included in any report.</Text>
        <Text style={p}>You can skip it.</Text>
      </>
    );
    footer = (
      <View style={styles.row}>
        <SecondaryButton
          label="Skip"
          style={styles.half}
          onPress={() => showQuestion({ ...progress, jitSeen: [...progress.jitSeen, item.id], qIdx: progress.qIdx + 1 })}
        />
        <PrimaryButton
          label="Continue"
          style={styles.half}
          onPress={() => {
            setProgress({ ...progress, jitSeen: [...progress.jitSeen, item.id] });
            setScreen('question');
          }}
        />
      </View>
    );
  } else if (screen === 'question' && item) {
    body = (
      <>
        <View style={styles.subhead}>
          <Text style={[ewsText.small, { color: colors.text.secondary }]}>{dim.name}</Text>
          <Text style={[ewsText.small, { color: colors.text.muted }]}>
            Question {progress.qIdx + 1} of {list.length}
            {item.optional ? ' · optional' : ''}
          </Text>
          <Text accessibilityRole="header" style={[ewsText.h4, { color: colors.text.primary }]}>
            {questionText(item, mode, elderName)}
          </Text>
        </View>
        <View style={styles.options} accessibilityRole="radiogroup">
          {item.options.map((o) => (
            <ChoiceCard key={o.code} label={optionLabel(item, o.code, mode)} selected={selected === o.code} onPress={() => setSelected(o.code)} />
          ))}
          {extra && <ChoiceCard label={extra.label} selected={selected === extra.code} onPress={() => setSelected(extra.code)} />}
        </View>
      </>
    );
    footer = <NavButtons onBack={back} onNext={() => selected && commit(selected)} nextLabel="Next" nextDisabled={!selected} />;
  } else if (screen === 'saved') {
    body = (
      <>
        <Text accessibilityRole="header" style={[ewsText.h2, { color: colors.text.primary }]}>
          Saved
        </Text>
        <Text style={p}>
          You’ve finished {doneAreas} of {DIMS.length} areas. Come back any time in the next 7 days to finish.
        </Text>
      </>
    );
    footer = (
      <View style={styles.stack}>
        <PrimaryButton label="Back to Home" onPress={leave} />
        <SecondaryButton label="Keep going" onPress={() => setScreen('intro')} />
      </View>
    );
  }

  return (
    <Shell
      title="Wellbeing check-in"
      onClose={screen === 'saved' ? leave : saveAndExit}
      closeLabel={screen === 'saved' ? 'Back to Home' : 'Save and exit'}
      footer={footer}
      scrollRef={scrollRef}
    >
      <StepBar current={Math.min(progress.dimIdx + 1, DIMS.length)} total={DIMS.length} label={`Area ${progress.dimIdx + 1} of ${DIMS.length}`} />
      {proxy && screen !== 'saved' && (
        <View style={[styles.note, styles.proxy, { backgroundColor: colors.background.orange }]}>
          <Text style={p}>
            You are answering about <Text style={{ color: colors.text.primary, fontFamily: theme.fonts.semiBold }}>{elderName}</Text>.
            Answer from what you have seen.
          </Text>
        </View>
      )}
      {body}

      <SafetyModal
        event={safetyEvent}
        mode={mode}
        context="check-in"
        onAction={recordAction}
        onToggleShare={(share) => setEvents((prev) => prev.map((e) => (e.key === openSafety?.key ? { ...e, share } : e)))}
        onContinue={closeSafety}
        onStopForNow={() => {
          recordAction('dismissed');
          saveAndExit();
        }}
        onQuickExit={() => {
          // Leave nothing personal on screen; the draft stays resumable.
          setOpenSafety(null);
          navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        }}
      />

      <ResultModal assessment={completed} onView={() => navigation.replace('EwsHome')} />
    </Shell>
  );
}

/** Figma pop-up sheet over the dimmed app (3344:323361), shared by every step. */
function Shell({
  title,
  onClose,
  closeLabel,
  footer,
  loading,
  scrollRef,
  children,
}: {
  title: string;
  onClose?: () => void;
  closeLabel?: string;
  footer?: React.ReactNode;
  loading?: boolean;
  scrollRef?: React.RefObject<ScrollView | null>;
  children?: React.ReactNode;
}) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top + theme.spacing.sm }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={[styles.behind, { top: insets.top, backgroundColor: colors.background.layout }]} />
      <View style={[styles.sheet, { backgroundColor: colors.background.layout }]}>
        <View style={styles.headline}>
          <View style={styles.side} />
          <Text accessibilityRole="header" style={[ewsText.h2, styles.title, { color: colors.text.primary }]} numberOfLines={1}>
            {title}
          </Text>
          {onClose ? (
            <IconButton type="close" bg={colors.accentPrimary} accessibilityLabel={closeLabel ?? 'Close'} onPress={onClose} size={40} />
          ) : (
            <View style={styles.side} />
          )}
        </View>
        {loading ? (
          <ActivityIndicator style={styles.loading} color={colors.accentPrimary} />
        ) : (
          <>
            <ScrollView ref={scrollRef} style={styles.flex} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
            {footer && <View style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing.xxl }]}>{footer}</View>}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // Figma frame fill behind the sheet: Neutral Color/Primary.
    backgroundColor: theme.colors.neutral[900],
  },
  behind: {
    position: 'absolute',
    left: 9,
    right: 9,
    height: 40,
    borderRadius: 16,
    opacity: 0.5,
  },
  sheet: {
    flex: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: theme.spacing.xxl,
  },
  headline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
  },
  side: {
    width: 40,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.xxl,
  },
  footer: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.md,
  },
  loading: {
    marginTop: theme.spacing.xxxxl,
  },
  subhead: {
    gap: theme.spacing.sm,
  },
  options: {
    gap: theme.spacing.sm,
  },
  note: {
    borderRadius: theme.radius.sm,
    borderWidth: 1.5,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  proxy: {
    borderWidth: 0,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.xxl,
  },
  half: {
    flex: 1,
    width: 'auto',
  },
  stack: {
    gap: theme.spacing.lg,
  },
});

export default EwsCheckInScreen;
