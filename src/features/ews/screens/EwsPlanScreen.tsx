import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '@/theme';
import { Screen, Header } from '@/components/layouts';
import { LightButton, PrimaryButton } from '@/components/buttons';
import { Checkbox } from '@/components/inputs';
import { useThemeColors } from '@/hooks/useThemeColors';
import { responsiveFontSize } from '@/utils/responsive';
import type { RootStackParamList } from '@/navigation/types';
import { useEws } from '../hooks/useEws';
import { getPlanDone, setPlanDone, type Assessment } from '../lib/ewsService';
import { focusAreas } from '../lib/flow';
import { BANDS, COPY, DIMS, dimById, type DimId } from '../lib/questionnaire';
import { CallbackSheet } from '../components/CallbackSheet';
import { ewsText } from '../components/text';

// "Full Care Plan" — Figma 3344:322597. Layout follows the frame (heading +
// intro, green "N/M DONE" banner, task cards with a green left rule, orange
// checkbox and area chip, the dark "Need a hand with your care?" band).
// Content follows the spec: tasks are each focus area's next steps (spec C/F),
// grouped by area rather than Figma's Morning / Afternoon / Evening
// placeholders (the steps aren't daily routines), so the banner counts all
// steps rather than "done today". Find support is discovery only.

type Nav = StackNavigationProp<RootStackParamList, 'EwsPlan'>;

export const EwsPlanScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const colors = useThemeColors();
  const ews = useEws();
  const latest = ews.latest?.result ? ews.latest : null;

  useEffect(() => {
    if (ews.status === 'ready' && !latest) navigation.replace('EwsHome');
  }, [ews.status, latest, navigation]);

  return (
    <Screen scrollable contentContainerStyle={styles.scroll}>
      <Header title="Care Plan" />
      {latest ? (
        <Plan key={latest.id} assessment={latest} onExplore={() => navigation.navigate('Home', { screen: 'ServiceTab' })} />
      ) : (
        <ActivityIndicator style={styles.loading} color={colors.accentPrimary} />
      )}
    </Screen>
  );
};

function Plan({ assessment, onExplore }: { assessment: Assessment; onExplore: () => void }) {
  const colors = useThemeColors();
  const result = assessment.result!;
  const focus = focusAreas(result);
  const tasks = focus.flatMap((dim) => COPY[dim].steps.map((step) => `${dim}:${step}`));
  const [done, setDone] = useState<string[]>([]);
  const [callbackOpen, setCallbackOpen] = useState(false);

  useEffect(() => {
    getPlanDone(assessment.id).then(setDone);
  }, [assessment.id]);

  const toggle = (id: string) => {
    const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id];
    setDone(next);
    setPlanDone(assessment.id, next);
  };

  const goingWell = DIMS.filter((d) => result.dims[d.id].band === 'going_well').slice(0, 3);
  const doneCount = done.filter((id) => tasks.includes(id)).length;

  return (
    <View style={styles.body}>
      <View style={styles.intro}>
        <Text accessibilityRole="header" style={[ewsText.h2, { color: colors.text.primary }]}>
          Your care plan
        </Text>
        <Text style={[ewsText.body, { color: colors.text.secondary }]}>
          Next steps for the areas that could use the most support right now. The plan updates each time you complete a check-in.
        </Text>
        {tasks.length > 0 && (
          <View style={[styles.banner, { backgroundColor: colors.accentPrimary }]} accessible accessibilityLabel={`${doneCount} of ${tasks.length} steps done`}>
            <Text style={[styles.count, { color: colors.textInverse }]}>
              {doneCount}/{tasks.length}
            </Text>
            <Text style={[ewsText.body, styles.upper, { color: colors.textInverse }]}>Done</Text>
          </View>
        )}
      </View>

      {focus.length === 0 && (
        <View style={[styles.card, { backgroundColor: colors.background.base }]}>
          <Text style={[ewsText.h5, { color: colors.text.primary }]}>Things are going well — keep it up</Text>
          {goingWell.map((d) => (
            <Text key={d.id} style={[ewsText.body, { color: colors.text.secondary }]}>
              • {COPY[d.id].going_well}
            </Text>
          ))}
        </View>
      )}

      {focus.map((dim) => (
        <TaskGroup key={dim} dim={dim} assessment={assessment} done={done} onToggle={toggle} />
      ))}

      {focus.length > 0 && (
        <View style={styles.group}>
          <Text accessibilityRole="header" style={[ewsText.h2, { color: colors.text.primary }]}>
            Find support
          </Text>
          <Text style={[ewsText.body, { color: colors.text.secondary }]}>Matched to the areas that could use the most support</Text>
          {focus.map((dim) => {
            const directory = COPY[dim].resources.find((r) => r.startsWith('Directory'));
            return (
              <View key={dim} style={[styles.card, { backgroundColor: colors.background.base }]}>
                <View style={[styles.chip, { backgroundColor: colors.accentOrangeSurface }]}>
                  <Text style={[ewsText.caption, { color: colors.accentOrangeText }]}>{dimById(dim).short}</Text>
                </View>
                <Text style={[ewsText.h5, { color: colors.text.primary }]}>{dimById(dim).name}</Text>
                <Text style={[ewsText.body, { color: colors.text.secondary }]}>
                  {directory?.replace(/^Directory: /, 'Browse ') ?? COPY[dim].resources[0]}
                </Text>
                <LightButton label="Explore services" onPress={onExplore} />
              </View>
            );
          })}
          <Text style={[ewsText.small, { color: colors.text.muted }]}>Listings are for discovery only – Serve Saathi does not endorse providers.</Text>
        </View>
      )}

      <View style={[styles.hand, { backgroundColor: colors.secondarySurface }]}>
        <Text style={[ewsText.h4, { color: colors.textInverse }]}>Need a hand with your care?</Text>
        <Text style={[ewsText.body, { color: colors.textInverse }]}>Your Saathi can help find a service or answer a care question.</Text>
        <PrimaryButton label="Talk to a Saathi" onPress={() => setCallbackOpen(true)} style={styles.handButton} />
      </View>

      <CallbackSheet visible={callbackOpen} onClose={() => setCallbackOpen(false)} category="general" />
    </View>
  );
}

function TaskGroup({ dim, assessment, done, onToggle }: { dim: DimId; assessment: Assessment; done: string[]; onToggle: (id: string) => void }) {
  const colors = useThemeColors();
  const d = dimById(dim);
  const band = assessment.result!.dims[dim].band;
  return (
    <View style={styles.group}>
      <Text accessibilityRole="header" style={[ewsText.h5, { color: colors.text.primary }]}>
        {d.name}
        <Text style={[ewsText.small, { color: colors.text.tertiary }]}>
          {'  '}· {BANDS[band].mark} {BANDS[band].label}
        </Text>
      </Text>
      {COPY[dim].steps.map((step) => {
        const id = `${dim}:${step}`;
        const checked = done.includes(id);
        return (
          <Pressable
            key={id}
            onPress={() => onToggle(id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
            accessibilityLabel={step}
            style={[styles.task, { backgroundColor: colors.background.base, borderLeftColor: colors.accentPrimary }]}
          >
            <View pointerEvents="none" style={styles.taskBox}>
              <Checkbox checked={checked} color="orange" />
            </View>
            <View style={styles.taskText}>
              <Text style={[ewsText.h5, { color: colors.text.secondary, textDecorationLine: checked ? 'line-through' : 'none' }]}>{step}</Text>
              <Text style={[ewsText.body, { color: colors.text.muted }]}>{COPY[dim][band as 'closer_look' | 'needs_attention']}</Text>
              <View style={[styles.chip, { backgroundColor: colors.accentOrangeSurface }]}>
                <Text style={[ewsText.caption, { color: colors.accentOrangeText }]}>{d.short}</Text>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
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
  intro: {
    gap: theme.spacing.lg,
  },
  banner: {
    minHeight: 101,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.sm,
    justifyContent: 'center',
  },
  count: {
    fontFamily: theme.fonts.regular,
    fontSize: responsiveFontSize(32),
    lineHeight: 42,
  },
  upper: {
    textTransform: 'uppercase',
  },
  group: {
    gap: theme.spacing.lg,
  },
  card: {
    borderRadius: theme.radius.sm,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 60,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 2,
  },
  task: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.lg,
    borderRadius: theme.radius.sm,
    borderLeftWidth: 4,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
  },
  taskBox: {
    paddingTop: 2,
  },
  taskText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  hand: {
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.xxxl,
    paddingVertical: theme.spacing.xxxl,
    gap: theme.spacing.lg,
  },
  handButton: {
    width: 200,
    marginTop: theme.spacing.sm,
  },
});

export default EwsPlanScreen;
