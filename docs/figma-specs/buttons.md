# Buttons — Figma spec reference

Source: Figma "Serve Saathi — Design System", node `103:287` ("❖ Buttons").

## Already implemented, now fixed to match spec

Compared the 5 button hierarchies (Primary/Secondary/Tertiary/Hyperlink/Destructive, each with Default/Pressed/Disabled) against `src/components/buttons/`. Fixed real mismatches:

- **All filled buttons** (`PrimaryButton`, `SecondaryButton`, `TertiaryButton`, `DestructiveButton`): `borderRadius` was `theme.radius.sm` (8px) but Figma specifies **6px** — the code comments even said "6px per design spec" while using a token that's actually 8. Hardcoded `borderRadius: 6` in each rather than changing the shared `radius.sm` token, since that token is used by 5 other unrelated components (cards, inputs, snackbar) not audited here.
- **TertiaryButton**: default text was `neutral[900]` (near-black), should be `neutral[700]` (#4B4946). Disabled text was `neutral[400]`, should be `neutral[300]` (#A5A4A3). Pressed state didn't change text color at all — Figma reuses the Primary/Secondary white-text block when Tertiary is pressed (dark bg needs white text), so pressed text is now white.
- **DestructiveButton**: default text/icon color was `status.error` (#DC2626, actually the *pressed* bg color in Figma) — should be `#991B1B` (a distinct darker red token, "red-text*icon"). Disabled text was `forestGreen[200]` (green — clearly wrong family), should be `#F87171` ("red-flagged"). Added both as `theme.colors.status.errorTextDefault` / `errorTextDisabled`.
- **HyperlinkButton**: used `typography.bodyMedium` (15px/22px) — Figma's Hyperlink button text is `Fonts/Size/md` = 16px, matching `typography.bodyLarge` (16px/22px) instead. Also defaulted to `underline: true`, but Figma's Hyperlink button shows no underline in any state (Default/Pressed/Disabled) — default flipped to `false`. (No existing call sites, so zero-risk change.)

## Not yet implemented — saved for later

### Icon slots (left + right arrow icons)
Every hierarchy in Figma (`Primary`, `Secondary`, `Tertiary`, `Hyperlink`, `Destructive`) supports **optional left AND right icon slots** (24×24, arrow icons in the reference file) alongside the label — see screenshot in the Standard Buttons frame (`179:7872`).

Current code only has `prefixIcon` (left-only) on `BaseButtonProps`, and even that's only wired up in `PrimaryButton` and `SecondaryButton` — `TertiaryButton` and `DestructiveButton` accept the prop type but never render it, and `HyperlinkButton` doesn't have an icon prop at all.

To fully match: add a `suffixIcon` prop alongside `prefixIcon` in `types.ts`, and wire both into `TertiaryButton`, `DestructiveButton`, and `HyperlinkButton`. The project's new `Icon` component (`src/components/icons`) already has `navigationLeft`/`navigationRight` arrow icons that match Figma's button icons if this gets built later.

### Notification / Alert component (node `581:800`)
Not implemented — `src/components/feedback/Toast.tsx` is a generic dark pill toast and doesn't match this design at all.

Figma spec: a white rounded card (`borderRadius:6`, `padding: 8px 16px`, width 264px), flex row `justify-between`, with a status label on the left and a 24×24 status icon on the right. Three states:

| Status | Label text | Label color | Icon |
|---|---|---|---|
| `Confirm` | "Confirmed successfully!" | `forestGreen[600]` (#256428) | green checkmark |
| `Awaiting` | "Awaiting verification" | `neutral[700]` (#4B4946) | grey question-mark |
| `Not Recognize` | "Barcode not recognized" | `vividOrange[600]` (#CC5E19) | orange warning |

Label font: Supporting text/Label style (Atkinson Hyperlegible Next Medium, 16px, lineHeight 22px — same "Medium doesn't exist as a font file" caveat as elsewhere; fall back to semiBold as done for other Label-style text).

No existing component to extend — this would be a new one, e.g. `src/components/feedback/StatusAlert.tsx` or similar, distinct from `Toast`.
