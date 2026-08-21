# Inputs & Forms — Figma spec reference

Source: Figma "Serve Saathi — Design System", node `103:289` ("❖ Inputs & Forms").

## Fixed: `TextInput` (and by extension `PasswordInput`/`SearchInput`, which wrap it)

Compared against Figma's "Input - Text" (node `262:12020`, 6 states: Enabled/Focus/Error/Disabled/Input/Read Only). Fixed:

- **Border radius**: was `theme.radius.sm` (8px) — Figma specifies `10px` (doesn't match any existing radius token, so hardcoded like the button/6px case).
- **Border color**: was `theme.colors.border.default` (`#ECEAEA`) for the default state — that color doesn't match *any* token Figma actually uses for this field. Figma's default/enabled border is `forestGreen[100]` (`#D5E5D6`, "background/g-line"). Focus stays primary green, error stays `status.error`, and disabled now correctly uses `neutral[200]` instead of reusing the default color.
- **Background on error**: was tinted `status.errorBg` (light red) — Figma keeps the field background plain white in every state, including error (only the border and helper text turn red). Fixed to always use `background.base`.
- **Label typography**: was `typography.smallCaption` (13px) — Figma's label is `Headings/H5` (16px/22px, semi-bold), which matches `theme.typography.h5`. Also added the disabled-label color (`neutral[500]`) which wasn't handled before (label was always `neutral[900]` or error-red, with no disabled case).
- **Helper/error text typography**: was `typography.bodySmall` (14px) — Figma's helper text is `Supporting text/Caption` (13px/17px), matching `theme.typography.caption`.

**Known deviation, not fixed**: Figma's actual input *value* text uses **DM Sans Regular**, not Atkinson Hyperlegible. The project only ships Atkinson Hyperlegible (Regular/Bold) as loaded fonts — no DM Sans asset exists — so `TextInput` keeps using `typography.bodyLarge` (Atkinson) for the typed value rather than referencing a font that isn't bundled. Same category of gap as the "Label style needs Medium weight" issue found earlier in the typography review.

## Built (src/components/inputs/)

| Component | Figma source |
|---|---|
| `Checkbox` | "Checkbox Item Base" — Checkbox + Filled Checkbox types (node `285:12631` green / `285:13134` orange), Default/Disabled states. |
| `RadioButton` | "Checkbox Item Base" — Radio type, both colors. |
| `CheckCircle` | "Checkbox Item Base" — Checkcircle type (green only in Figma — no orange variant exists). |
| `ToggleSwitch` | "Checkbox Item Base" — Toggle type. **Approximation**: Figma's toggle assets are flattened raster images (`_Toggle base` PNGs for each on/off/disabled state), not decomposable paths, so this was rebuilt as a standard animated pill-and-thumb switch instead of extracting those images. |
| `SelectableChip` | "Select Input" (node `327:13583`, orange) — label + embedded checkbox chip button. Distinct from the icon-based `SelectCard` already built for Card Views (same Figma name, different component/section — don't confuse the two). |
| `PlanSelectCard` | "Subscription Plan" (node `378:5858`) — radio-selectable pricing row with a "See Benefits" link. |

All wired into `src/components/inputs/index.ts`.

## Not built — saved for later

### Phone Number input (node `222:8292`, "Input - Phone number Text")
A two-segment field: a `(+91) ⌄` country-code selector box (own rounded-left corners, own border) directly adjacent to the number-entry box (rounded-right corners), sharing one visual border color per state (Enabled/Focus/Error/Disabled/Input use `forestGreen[100]`/primary-green/red/`neutral[200]` respectively — same palette as the fixed `TextInput`).

Not built as a proper reusable component. Currently, `LoginScreen.tsx` approximates this with a plain `TextInput` plus a custom local `CountryCodePrefix` (text + chevron) passed as `prefixIcon` — a reasonable one-off approximation, but it doesn't give the two-segment bordered-box look Figma specifies, and a real implementation would need a country picker (dropdown/sheet with a country list), which is a meaningfully bigger feature than a visual tweak. Worth building a proper `PhoneInput` component if country selection ever needs to be functional (not just a static "+91").

### General note: `theme.colors.border.default` (`#ECEAEA`)
This token doesn't match any border color actually used across the Buttons, Cards, or Inputs Figma pages reviewed so far (input borders use `forestGreen[100]`/`g-line`, `#D5E5D6`). It's currently used in 7 other files (`ActionCard`, `FeatureCard`, `Section`, `Divider`, `EmptyState`, `ErrorState`, `OTPInput`) that weren't part of this Figma page's review, so left untouched — but worth a dedicated audit later since it looks like a leftover/invented value rather than a real design token.
