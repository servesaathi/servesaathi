# Pop up — Figma spec reference

Source: Figma "Serve Saathi — Design System", node `206:5905`... actually `2356:322` ("❖ Pop up"). Entirely about a "Compare" feature — building a comparison set of organizations/caregivers, up to 3 at a time — which didn't exist anywhere in the codebase (no `Modal`/`BottomSheet`/"compare" hits at all before this).

## Built (src/components/cards/)

- **`ComparePopUpCard`** — the individual comparison item card (photo, title + verified badge, location · distance, a `Checkbox` + "Compare" label row, a star-rating chip, and a "See details" button). This was actually fetched from Figma during the earlier Card Views pass (node `2083:961`) but fell through the cracks and was never built then — built now since `CompareBar` needed it.
- **`CompareBar`** — the mobile bottom drawer ("Compare Pop up Expand / Mobile," node `2083:1030`): a collapsed header ("Add more items" + a "Compare" button) with a caret toggle (using the existing `caretUp`/`caretDown` icons), expanding to show up to `maxItems` (default 3) slots — filled slots show a 100×100 photo + name + a green circular close (X) badge; empty slots are dashed placeholders with a `+` icon (`add` icon).

Both wired into `src/components/cards/index.ts`.

## Not built — not applicable

**"Compare Pop up Expand / Desktop"** (node `2356:779`) — a desktop/web layout of the same compare drawer (wider, side-by-side). Skipped for the same reason as the website Header/Footer sections: this is a React Native mobile app with no web surface. Revisit if a companion website is ever built.

## Notes on fidelity
- `ComparePopUpCard`'s rating chip and layout reuse the same visual patterns as `StatusChip`/`OrganizationCard` rather than introducing new one-off styling.
- Not yet wired into any real screen or state management — `CompareBar` takes `items`/`onRemoveItem`/`onAddPress`/`onComparePress` as props but there's no feature screen calling it yet. Whoever builds the actual "compare organizations" flow will need to supply that state.
