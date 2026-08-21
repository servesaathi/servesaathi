# Card Views — Figma spec reference

Source: Figma "Serve Saathi — Design System", node `103:288` ("❖ Card Views"). ~30 distinct card designs across 3 sections. None of the pre-existing components (`ActionCard`, `FeatureCard`, `InfoCard`) corresponded to any of these by name — they're generic, independently-built components, left untouched.

## Built (src/components/cards/)

| Component | Figma source | Notes |
|---|---|---|
| `StatusChip` | "Pop-over Chip" (used across many cards) | Shared primitive: `primary` / `softOrange` / `softGreen` / `rating` variants, plus raw `bgColor`/`textColor` overrides for one-off combos. |
| `FieldCard` | "Field Card View" (node `2178:1183`) | Icon-avatar row card, `styleColor: 'green' \| 'orange'`. |
| `ProfileIdCard` | "Profile ID Card" (node `2018:9471`) | 6 statuses: `available`, `unavailable`, `review`, `statusOn`, `statusOff`, `profileContact`. |
| `EventCard` | "Upcoming Event" / "Upcoming Event 2" / "Upcoming Event 3" (nodes `2018:9825`, `2018:9934`, and an unfetched near-duplicate `2018:9877`) | Cover image + date badge + title/time + location-or-price. The 3 Figma variants are the same card with minor prop differences (some show a Zoom-room location row, some show a price chip) — unified into one component. |
| `SelectCard` | "Select Input" (nodes `2018:9631/9641/9651/9657/9663/9673/9683/9689`) | Icon+label selector, `orientation: 'grid' \| 'list'`, `selected` boolean. All 8 Figma instances were the same component at different sizes/icons — not 8 separate designs. |
| `DateCard` | "Date Card" (node `2018:9695`) | On/Of → `selected` boolean. |
| `TimeCard` | "Time Card" (node `2018:9706`) | On/Of/Status3 → `status: 'selected' \| 'default' \| 'disabled'`. |
| `IconCard` | "Icon Card" (node `2018:9467`, Section 1) | Circular icon + label chip. Note: a *second*, visually different "Icon Card" exists in Label Cards (node `2037:478`, Dark/Light half-pill shape) — not built, see below. |
| `VerificationCard` | "Verification ID Card" (node `2018:9734`) | Verified / Due Soon. |
| `OrganizationCard` | "Organization Card Views" (node `2319:1205`) | Event / Status / Category statuses built; `Status 2` (node `2319:1538`, a stacked layout variant of Status) approximated by the same `status="status"` rendering rather than a distinct 4th mode. |
| `ProfileImageCard` | "Profile Image Card" (node `2018:9793`) | Photo / Non-Photo. Uses the `camera` icon as an empty-state placeholder (Figma's own placeholder glyph wasn't extracted). |
| `FavoriteButton` | "Favorite" (node `2018:9722`) | Heart toggle. Figma's heart glyph wasn't in the extracted icon set — this draws an equivalent heart path directly via `react-native-svg` rather than depending on `Icon`. |
| `FilterChip` | "Selected Tab 2" (node `2018:9992`) + "Selected Chip" (node `2018:9729`) | Merged into one chip component (`selected`, `showCloseIcon`) since they're the same interaction pattern at different visual weights. |
| `HomeInfoCard` | "Card View" (node `2018:9253`, Label Cards) | 6 statuses: `quote`, `withCaption`, `withoutCaption`, `withoutButton`, `profile`, `walletBalance`. **Approximation**: Figma's background is a photographic dark-green image with a decorative dot pattern overlay (`imgStatusWithoutCaption` etc.) — no such asset was extracted, so this renders a plain two-stop `expo-linear-gradient` (forestGreen 500 → 900) instead. Visually close but not pixel-identical to the textured original. |

All new components use existing `theme` tokens (colors/typography/spacing/radius) and the `Icon` component from `src/components/icons` — no new dependencies except `expo-linear-gradient`, which was already installed and used elsewhere (`SplashScreen`, `OnboardingScreen`, `ProfileScreen`).

## Not built — saved for later

### Emotion Tracker (section `2018:10521`)
Not implemented at all. This is a hand-illustrated mascot system, not simple recolorable icons — each mood state is a distinct flower-shaped character illustration (custom artwork), not a shape+color combination like the rest of the design system. Four sub-components:

- **"Emotion Scale without [Line]"** (node `2018:9095`) — 6 mood states (`Very Happy`, `Happy`, `Okay`, `Sad`, `Very Upset`, `Anxious`), each with `Show=Off` (plain line-drawn face) and `Show=On` (full illustrated flower-mascot) states. 90×90 each.
- **"Emotion Scale with Line"** (node `2018:9212`) — same 5-state mood scale (`Very Happy`/`Happy`/`Ok-Ok`/`Sad`/`Very Sad`) laid out along a horizontal track/slider (`background/g-line` colored bar, 312×36), with the selected mood rendered as the full mascot and the rest as small line-drawn faces.
- **"Emotion Scale with Text & Line"** (node `2018:9306`) — same slider pattern plus a text label under the selected mascot (`Great`/`Good`/`Okay`/`Bad`/`Terrible`, DM Sans Medium 14px, color `vividOrange[700]` #994613).
- **"Emotion Icon Card"** (node `2018:9806`) — mascot + label chip, `status: boolean` (on = full-color mascot, off = pale/desaturated mascot), used standalone (e.g. mood check-in entry point).

To build this properly: download each mood's mascot SVG/PNG per state (similar to the icon-extraction pass done earlier for `src/components/icons`), then build a `MoodSlider` / `EmotionScale` component around those assets. Skipped here because it's a large separate asset-extraction effort, not a quick component build.

### Second "Icon Card" variant (node `2037:478`, Label Cards)
Half-pill shaped card (98.67×144): a rounded-bottom color block (`Dark` = solid `vividOrange[500]`, `Light` = `vividOrange[100]`) holding a 46×46 icon, with a label below on a white card background. Visually distinct from the circular `IconCard` that was built (Section 1, node `2018:9467`) — same *concept* (icon + label), different shape entirely. Not built since one Icon Card variant already covers the "icon shortcut chip" use case; build this one specifically if a design calls for the half-pill shape.

### Minor near-duplicate nodes not individually fetched
These appeared in the metadata as separate symbols but are almost certainly the same components as ones already documented above, just different example data:
- `2018:9877` "Upcoming Event 2" → same as `EventCard`
- `2018:9358` / `2018:9371` "Field" (312×64, standalone) → likely the same as `FieldCard` at a slightly different height; verify against `EventCard`'s bottom "Field" section before assuming
- `2177:1504` "Field Card View 2" → likely a compact variant of `FieldCard`
- `2018:9415` "Upcoming 2 Card" (312×104, top-level, outside any section) → possibly a condensed `EventCard` without the image

Worth a quick fetch-and-diff pass if any of these turn out to need distinct treatment once real screens are built against them.
