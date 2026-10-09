import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { theme } from '@/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { FONT_SIZE_DEFAULT, useAccessibilityStore } from '@/store/accessibility.store';
import type { Assessment } from '../lib/ewsService';
import { overallShort } from '../lib/flow';
import { FIRST_CHECK_IN, TREND_GUARDRAIL } from '../lib/questionnaire';
import { ewsText } from './text';

// "Score trend" card — Figma 3344:322691: title + "Tap a point for details",
// the orange 3M / 6M / 1Y switch, a legend, then the line of past overall
// scores with the going-well zone shaded. Spec I rules applied:
//   - family-answered (proxy) check-ins get a hollow marker and are never
//     joined into the same line as the elder's own (Figma's "Recorded /
//     Missed" legend becomes "You / Answered by family");
//   - at most one result per 7 days (the latest) is plotted;
//   - every trend view carries the "not a medical measurement" guardrail.

const RANGES = [
  { id: '3M', months: 3 },
  { id: '6M', months: 6 },
  { id: '1Y', months: 12 },
] as const;
type RangeId = (typeof RANGES)[number]['id'];

const H = 200;
const PAD = { l: 8, r: 34, t: 12, b: 28 };
const INSET = { l: 14, r: 22 };
const WEEK = 7 * 86_400_000;
const at = (a: Assessment) => new Date(`${a.completedOn}T00:00:00`).getTime();
const fmtDate = (a: Assessment) =>
  new Date(`${a.completedOn}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/** Newest first in → oldest first out, keeping the latest result in any 7 days. */
export function weeklyLatest(history: Assessment[]): Assessment[] {
  const kept: Assessment[] = [];
  for (const a of history) {
    if (a.result?.internal == null) continue;
    const last = kept[kept.length - 1];
    if (!last || at(last) - at(a) >= WEEK) kept.push(a);
  }
  return kept.reverse();
}

export const ScoreTrend: React.FC<{ history: Assessment[] }> = ({ history }) => {
  const colors = useThemeColors();
  const [range, setRange] = useState<RangeId>('6M');
  const [active, setActive] = useState<string | null>(null);
  const [width, setWidth] = useState(0);
  const [now] = useState(() => Date.now());
  // Svg <Text> isn't covered by the app-wide Text font-size patch, so the axis
  // labels apply the user's accessibility font size themselves.
  const label = Math.round(14 * (useAccessibilityStore((s) => s.fontSize) / FONT_SIZE_DEFAULT));

  const months = RANGES.find((r) => r.id === range)!.months;
  const from = useMemo(() => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - months);
    return d.getTime();
  }, [now, months]);
  const points = weeklyLatest(history).filter((a) => at(a) >= from);

  const span = now - from || 1;
  // Points sit inside the grid, clear of the y-axis labels on the right — a
  // check-in from today otherwise lands on top of "100".
  const x = (t: number) => PAD.l + INSET.l + ((t - from) / span) * (width - PAD.l - PAD.r - INSET.l - INSET.r);
  const y = (score: number) => PAD.t + (1 - score / 100) * (H - PAD.t - PAD.b);
  const own = points.filter((a) => a.mode !== 'proxy');
  const line = own.map((a, i) => `${i ? 'L' : 'M'}${x(at(a)).toFixed(1)},${y(a.result!.internal!).toFixed(1)}`).join(' ');
  const selected = points.find((a) => a.id === active) ?? points[points.length - 1];

  // Month labels along the bottom, like Figma's Mar … Aug.
  const ticks: { t: number; label: string }[] = [];
  const stepMonths = months === 12 ? 2 : 1;
  for (let m = months - 1; m >= 0; m -= stepMonths) {
    const d = new Date(now);
    d.setDate(1);
    d.setMonth(d.getMonth() - m);
    if (d.getTime() >= from) ticks.push({ t: d.getTime(), label: d.toLocaleDateString('en-IN', { month: 'short' }) });
  }

  const grid = colors.text.muted;
  const dot = colors.accentPrimaryStrong;

  return (
    <View style={[styles.card, { backgroundColor: colors.background.base }]}>
      <View>
        <Text accessibilityRole="header" style={[ewsText.h3, { color: colors.text.secondary, lineHeight: 24 }]}>
          Score trend
        </Text>
        <Text style={[ewsText.italic, { color: colors.text.muted, fontStyle: 'normal' }]}>Tap a point for details</Text>
      </View>

      <View style={[styles.switch, { backgroundColor: colors.accentOrange }]} accessibilityRole="tablist">
        {RANGES.map((r) => {
          const on = range === r.id;
          return (
            <Pressable
              key={r.id}
              onPress={() => setRange(r.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`Last ${r.months} months`}
              style={[styles.seg, on && { backgroundColor: colors.background.base }]}
            >
              <Text style={[ewsText.body, { color: on ? colors.accentOrange : colors.textInverse }]}>{r.id}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: dot, borderColor: dot }]} />
          <Text style={[ewsText.small, { color: colors.text.muted }]}>You</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { borderColor: dot }]} />
          <Text style={[ewsText.small, { color: colors.text.muted }]}>Answered by family</Text>
        </View>
      </View>

      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height: H }}>
        {width > 0 && (
          <Svg
            width={width}
            height={H}
            accessibilityRole="image"
            accessibilityLabel={`${points.length} check-in${points.length === 1 ? '' : 's'} in the last ${months} months`}
          >
            <Rect x={PAD.l} y={y(100)} width={width - PAD.l - PAD.r} height={y(75) - y(100)} fill={colors.accentPrimary} opacity={0.15} />
            {[25, 50, 75, 100].map((v) => (
              <React.Fragment key={v}>
                <Line x1={PAD.l} x2={width - PAD.r} y1={y(v)} y2={y(v)} stroke={grid} strokeOpacity={0.5} strokeDasharray="3 3" />
                <SvgText x={width - PAD.r + 6} y={y(v) + 5} fontSize={label} fontFamily={theme.fonts.regular} fill={grid}>
                  {v}
                </SvgText>
              </React.Fragment>
            ))}
            {ticks.map((t) => (
              <SvgText key={t.t} x={x(t.t)} y={H - 6} fontSize={label} fontFamily={theme.fonts.regular} fill={colors.text.secondary} textAnchor="middle">
                {t.label}
              </SvgText>
            ))}
            {own.length > 1 && <Path d={line} fill="none" stroke={colors.accentPrimary} strokeWidth={2.5} strokeLinejoin="round" />}
            {points.map((a) => {
              const proxy = a.mode === 'proxy';
              const on = selected?.id === a.id;
              return (
                <React.Fragment key={a.id}>
                  <Circle
                    cx={x(at(a))}
                    cy={y(a.result!.internal!)}
                    r={on ? 7 : 5.5}
                    fill={proxy ? colors.background.base : dot}
                    stroke={dot}
                    strokeWidth={2}
                  />
                  {on && <Callout x={x(at(a))} y={y(a.result!.internal!)} value={a.result!.internal!} size={label} />}
                  {/* Larger invisible hit target — 44px is hard to hit on a 6px dot. */}
                  <Circle cx={x(at(a))} cy={y(a.result!.internal!)} r={20} fill="transparent" onPress={() => setActive(a.id)} />
                </React.Fragment>
              );
            })}
          </Svg>
        )}
      </View>

      {selected ? (
        <Text style={[ewsText.body, { color: colors.text.secondary }]} accessibilityLiveRegion="polite">
          <Text style={{ color: colors.text.primary, fontFamily: theme.fonts.semiBold }}>{fmtDate(selected)}</Text> ·{' '}
          {selected.result!.internal} out of 100 · {overallShort(selected.result!)}
          {selected.mode === 'proxy' && selected.proxy ? ` · answered by your ${selected.proxy.relationship}` : ''}
        </Text>
      ) : (
        <Text style={[ewsText.body, { color: colors.text.secondary }]}>No check-ins in this period.</Text>
      )}
      {history.length === 1 && <Text style={[ewsText.body, { color: colors.text.secondary }]}>{FIRST_CHECK_IN}</Text>}
      <Text style={[ewsText.small, { color: colors.text.muted }]}>{TREND_GUARDRAIL}</Text>
    </View>
  );
};

/** The selected point's score, in a small green tag above it (below it near the top edge). */
function Callout({ x, y, value, size }: { x: number; y: number; value: number; size: number }) {
  const colors = useThemeColors();
  const w = size * 2 + 14;
  const h = size + 10;
  const top = y - h - 12 < 0 ? y + 12 : y - h - 12;
  return (
    <>
      <Rect x={x - w / 2} y={top} width={w} height={h} rx={6} fill={colors.accentPrimary} />
      <SvgText x={x} y={top + h / 2 + size / 3} fontSize={size} fontFamily={theme.fonts.semiBold} fill={colors.textInverse} textAnchor="middle">
        {value}
      </SvgText>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  switch: {
    flexDirection: 'row',
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
  },
  seg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: theme.spacing.xs,
    minHeight: 36,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
});

export default ScoreTrend;
