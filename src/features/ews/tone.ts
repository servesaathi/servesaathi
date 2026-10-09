import type { ThemePalette } from '@/theme/palette';
import type { DimBand, OverallBand } from './lib/questionnaire';

// Band → colour treatment, from the Figma area rows (3344:322768): green tile
// and number for good areas, orange for "worth a closer look", red for "needs
// attention". Spec F's band words replace Figma's chip labels, and every chip
// carries the band's symbol so colour is never the only signal.

export type Tone = {
  /** Icon tile behind the area glyph. */
  tile: string;
  /** Area glyph and score number. */
  fg: string;
  chipBg: string;
  chipText: string;
  /** Not applicable / not enough info: the glyph is drawn faded. */
  muted?: boolean;
};

export const dimTone = (band: DimBand, c: ThemePalette): Tone => {
  switch (band) {
    case 'going_well':
      return { tile: c.border.hairline, fg: c.accentPrimary, chipBg: c.border.hairline, chipText: c.accentPrimary };
    case 'closer_look':
      return { tile: c.background.orange, fg: c.accentOrange, chipBg: c.accentOrangeSurface, chipText: c.accentOrangeText };
    case 'needs_attention':
      return { tile: c.errorSurface, fg: c.error, chipBg: c.errorSurface, chipText: c.error };
    default:
      return { tile: c.background.layout, fg: c.text.muted, chipBg: c.background.layout, chipText: c.text.tertiary, muted: true };
  }
};

/** Overall chip (Figma "Pop-over Chip"): green for going well, orange otherwise. */
export const overallTone = (band: OverallBand, c: ThemePalette): { bg: string; text: string } => {
  if (band === 'going_well' || band === 'mostly_one') return { bg: c.border.hairline, text: c.accentPrimary };
  if (band === 'insufficient') return { bg: c.background.layout, text: c.text.tertiary };
  return { bg: c.accentOrangeSurface, text: c.accentOrangeText };
};
