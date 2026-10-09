import React, { useState } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import { LightButton, PrimaryButton } from '@/components/buttons';
import { useThemeColors } from '@/hooks/useThemeColors';
import type { EwsResult } from '../lib/scoring';
import { BANDS, COPY, DIMS, type DimId } from '../lib/questionnaire';
import { dimTone } from '../tone';
import { ewsText } from './text';
import DimIcon from '../../../../assets/ews/dim-icon.svg';
import ChevronDown from '../../../../assets/ews/chevron-down.svg';

// "The 9 dimensions" accordion — Figma 3344:322768 (rows) and its expanded
// panel (3344:322770). Eight rows, one per spec area. Expanded:
//   - "What we noticed" → the spec's plain-language line for the area's band
//     (spec C), never individual answers;
//   - "Clinical recommendations" → "Suggested next steps" from COPY.steps — the
//     EWS isn't a clinical assessment, so it doesn't claim to be one;
//   - "Recommended Service ₹749 / Book now" → "Find support": discovery only
//     (no prices, no booking) — Explore services and a callback.

type AreaListProps = {
  result: EwsResult;
  onExploreServices: () => void;
  onRequestCallback: (dim: DimId) => void;
};

export const AreaList: React.FC<AreaListProps> = ({ result, onExploreServices, onRequestCallback }) => {
  // Open the first focus area by default, like Figma's expanded frame.
  const firstFocus = DIMS.find((d) => result.dims[d.id].band === 'needs_attention' || result.dims[d.id].band === 'closer_look');
  const [open, setOpen] = useState<DimId | null>(firstFocus?.id ?? null);

  return (
    <View style={styles.list}>
      {DIMS.map((d, i) => (
        <AreaRow
          key={d.id}
          dim={d.id}
          result={result}
          first={i === 0}
          last={i === DIMS.length - 1}
          open={open === d.id}
          onToggle={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setOpen(open === d.id ? null : d.id);
          }}
          onExploreServices={onExploreServices}
          onRequestCallback={() => onRequestCallback(d.id)}
        />
      ))}
    </View>
  );
};

function AreaRow({
  dim,
  result,
  first,
  last,
  open,
  onToggle,
  onExploreServices,
  onRequestCallback,
}: {
  dim: DimId;
  result: EwsResult;
  first: boolean;
  last: boolean;
  open: boolean;
  onToggle: () => void;
  onExploreServices: () => void;
  onRequestCallback: () => void;
}) {
  const colors = useThemeColors();
  const d = DIMS.find((x) => x.id === dim)!;
  const r = result.dims[dim];
  const tone = dimTone(r.band, colors);
  const copy = COPY[dim];
  const band = BANDS[r.band];
  const scored = r.band !== 'not_applicable' && r.band !== 'insufficient';
  const support = scored && r.band !== 'going_well';
  const noticed =
    r.band === 'not_applicable'
      ? 'No regular medicines reported.'
      : r.band === 'insufficient'
        ? 'We need a few more answers in this area to show how it’s going.'
        : copy[r.band];
  const directory = copy.resources.find((x) => x.startsWith('Directory'));
  const otherHelp = copy.resources.filter((x) => x !== directory);
  const radius = {
    borderTopLeftRadius: first ? theme.radius.sm : 0,
    borderTopRightRadius: first ? theme.radius.sm : 0,
    borderBottomLeftRadius: last && !open ? theme.radius.sm : 0,
    borderBottomRightRadius: last && !open ? theme.radius.sm : 0,
  };

  return (
    <View>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${d.name}. ${band.label}, ${r.score ?? 'no'} score.`}
        style={({ pressed }) => [
          styles.row,
          radius,
          { backgroundColor: pressed ? colors.background.layout : colors.background.base, borderBottomColor: colors.border.hairline },
        ]}
      >
        <View style={styles.left}>
          <View style={[styles.tile, { backgroundColor: tone.tile }]}>
            <DimIcon width={30} height={30} color={tone.fg} opacity={tone.muted ? 0.4 : 1} />
          </View>
          <View style={styles.flex}>
            <Text style={[ewsText.h5, { color: colors.text.secondary }]}>{d.name}</Text>
            <Text style={[ewsText.small, { color: tone.chipText }]}>
              {band.mark} {band.label}
            </Text>
          </View>
        </View>
        <View style={styles.right}>
          <Text style={[ewsText.h2, { color: tone.fg }]}>{r.score ?? '–'}</Text>
          <View style={open && styles.flip}>
            <ChevronDown width={22} height={22} color={colors.text.primary} />
          </View>
        </View>
      </Pressable>

      {open && (
        <View
          style={[
            styles.panel,
            { backgroundColor: colors.background.base, borderBottomColor: colors.border.hairline },
            last && styles.panelLast,
          ]}
        >
          <View style={styles.block}>
            <Text style={[ewsText.overline, { color: colors.text.secondary }]}>What we noticed</Text>
            <Text style={[ewsText.bodyMd, { color: colors.text.secondary }]}>{noticed}</Text>
          </View>

          {support && (
            <View style={[styles.box, { backgroundColor: colors.background.layout }]}>
              <Text style={[ewsText.overline, { color: colors.accentPrimaryStrong }]}>Suggested next steps</Text>
              {copy.steps.map((s) => (
                <Bullet key={s} text={s} color={colors.accentPrimaryStrong} />
              ))}
            </View>
          )}

          {support && (
            <View style={[styles.box, styles.support, { backgroundColor: colors.background.orange }]}>
              <Text style={[ewsText.overline, { color: colors.accentOrangeText }]}>Find support</Text>
              <Text style={[ewsText.h5, { color: colors.text.primary }]}>Things that can help</Text>
              <View>
                {otherHelp.map((x) => (
                  <Bullet key={x} text={x} color={colors.text.secondary} />
                ))}
              </View>
              {directory && <Text style={[ewsText.small, { color: colors.text.tertiary }]}>{directory}</Text>}
              <PrimaryButton label="Explore services" onPress={onExploreServices} />
              <LightButton label="Request a callback" onPress={onRequestCallback} />
              <Text style={[ewsText.small, { color: colors.text.muted }]}>
                Listings are for discovery only – Serve Saathi does not endorse providers.
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const Bullet: React.FC<{ text: string; color: string }> = ({ text, color }) => (
  <View style={styles.bullet}>
    <Text style={[ewsText.bodyMd, { color }]}>•</Text>
    <Text style={[ewsText.bodyMd, styles.flex, { color }]}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  list: {
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  tile: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 57,
    gap: theme.spacing.xs,
  },
  flip: {
    transform: [{ rotate: '180deg' }],
  },
  panel: {
    gap: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
  },
  panelLast: {
    borderBottomLeftRadius: theme.radius.sm,
    borderBottomRightRadius: theme.radius.sm,
  },
  block: {
    gap: 2,
  },
  box: {
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    gap: 2,
  },
  support: {
    gap: theme.spacing.sm,
  },
  bullet: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingLeft: theme.spacing.xs,
  },
});

export default AreaList;
