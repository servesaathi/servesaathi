// Small hex-color helpers for computing interaction states (pressed, etc.)
// from a theme token at runtime, instead of hardcoding a separate swatch per
// theme for every state.

/** Darkens a `#RGB`/`#RRGGBB` hex color by `amount` (0–1, fraction of each
 * channel to remove). Non-hex input is returned unchanged. */
export const darken = (hex: string, amount: number): string => {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return hex;
  let value = match[1];
  if (value.length === 3) {
    value = value
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const scale = 1 - amount;
  const channel = (start: number) =>
    Math.round(parseInt(value.slice(start, start + 2), 16) * scale)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(0)}${channel(2)}${channel(4)}`;
};
