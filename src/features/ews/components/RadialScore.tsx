import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { useThemeColors } from '@/hooks/useThemeColors';
import { DIMS, BANDS } from '../lib/questionnaire';
import type { EwsResult } from '../lib/scoring';

// Figma "RadialHistogram" (3350:381113), drawn to its geometry: a 132px
// polar-area chart, wedges starting at 9 o'clock and running clockwise with a
// hairline angular gap, solid fills from the Figma orange ramp, three faint
// white guide rings on top (20% opacity) and a filled 17px centre. The only
// difference from the static Figma art is that each petal's length is the
// area's real score (decided with the user), one petal per spec area. Colour
// is per area (Figma's ramp, in Figma's order), not per band — band words and
// numbers are always printed beside the chart.

const VIEW = 132;
const C = VIEW / 2;
const HOLE = 17.2;
const GAP_DEG = 0.8;
/** Figma's fills in drawing order (its pale #FFE3D2 sliver dropped: 8 areas, not 9). */
const RAMP = ['#4C2408', '#994613', '#FFAC79', '#FFC8A5', '#662F0C', '#CC5E19', '#FF751F', '#FF914C'];
/** Figma ring radii (33.3 / 49.4 / 66 of 66) as fractions of the petal range. */
const RINGS = [33.3, 49.4, 66];

const point = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return `${(C + r * Math.cos(a)).toFixed(2)},${(C + r * Math.sin(a)).toFixed(2)}`;
};

/** Annular wedge between radii r0..r1 and angles a0..a1 (degrees, 0 = 3 o'clock, clockwise). */
const wedge = (r0: number, r1: number, a0: number, a1: number) =>
  `M${point(r0, a0)} L${point(r1, a0)} A${r1},${r1} 0 0 1 ${point(r1, a1)} L${point(r0, a1)} A${r0},${r0} 0 0 0 ${point(r0, a0)} Z`;

export const RadialScore: React.FC<{ result: EwsResult; size?: number }> = ({ result, size = VIEW }) => {
  const colors = useThemeColors();
  const step = 360 / DIMS.length;
  const label = DIMS.map((d) => {
    const r = result.dims[d.id];
    return `${d.name}: ${r.score ?? 'no score'}, ${BANDS[r.band].label}`;
  }).join('. ');

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VIEW} ${VIEW}`} accessibilityRole="image" accessibilityLabel={`Area scores. ${label}`}>
      {DIMS.map((d, i) => {
        const score = result.dims[d.id].score;
        // Polar-area chart: petal *area* tracks the score, so the radius grows
        // with its square root (a linear radius would make low scores look far
        // smaller than they are). Areas without a score keep a short faded stub.
        const frac = score == null ? 0.12 : Math.max(0.1, Math.sqrt(score / 100));
        const a0 = 180 + i * step + GAP_DEG / 2;
        return (
          <Path
            key={d.id}
            d={wedge(HOLE, HOLE + (C - HOLE) * frac, a0, a0 + step - GAP_DEG)}
            fill={RAMP[i]}
            fillOpacity={score == null ? 0.35 : 1}
          />
        );
      })}
      {RINGS.map((r) => (
        <Circle key={r} cx={C} cy={C} r={r - 0.5} stroke="#FFFFFF" strokeOpacity={0.2} fill="none" />
      ))}
      <Circle cx={C} cy={C} r={HOLE} fill={colors.background.base} />
    </Svg>
  );
};

export default RadialScore;
