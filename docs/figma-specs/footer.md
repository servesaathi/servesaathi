# Footer / Bottom Nav — Figma spec reference

Source: Figma "Serve Saathi — Design System", node `2295:830` ("❖ Footer / Bottom Nav").

## Mobile Bottom Nav — fixed in `src/navigation/BottomTabNavigator.tsx`

Compared against Figma's "Bottom Nav Bar" (node `2018:8867`) and the 5-icon set (node `2017:8551`: Home / Service / Helpline / Profile / Setting, each Off/On). Fixed:

- **Border**: bar had no top border at all — added `borderTopWidth: 1.5, borderTopColor: forestGreen[100]` (`#D5E5D6`, Figma's `background/g-line`).
- **Corners**: bar had `borderTopLeftRadius`/`borderTopRightRadius: theme.radius.lg` (rounded top corners) — Figma's bar is flat with square corners; removed.
- **Height**: nav row was `72px`, Figma specifies `64px`.
- **Horizontal padding**: was `theme.spacing.sm` (8px), Figma specifies `16px` (`theme.spacing.lg`).
- **Label size**: was `11px` with no explicit line height — Figma's label is `Fonts/Size/sm` = 14px, lineHeight 20px (`theme.typography.bodySmall`).
- **Active color**: active icon/label used `neutral[900]` (near-black `#1E1B18`) — Figma's active state uses `neutral-color/secondary` = `neutral[700]` (`#4B4946`), a lighter shade.
- **Fake active-indicator removed**: the previous code drew a small underline bar beneath the active tab. That's not present in Figma — the horizontal line visible in the Figma mockup screenshot is the OS home-indicator ("Gesture bar," a separate 24px strip below the nav bar), not a per-tab active indicator. Removed the invented `activeIndicator` view/style entirely.
- **Service icon**: was `ClipboardList` (lucide) — Figma's Service icon is an open-book glyph, not a clipboard. Swapped to `BookOpen` (lucide), which is already used elsewhere in the ecosystem and closely matches the design.
- **Safe area**: bottom padding was a hardcoded `24`. Switched to `useSafeAreaInsets().bottom` (matching the pattern already used in `Header.tsx`) so it's correct across different device home-indicator heights instead of an assumed constant.

Not changed: the floating circular Helpline button (56×56, orange, phone icon, floats above the bar) — this already matched Figma's overlay pattern (a normal flex nav slot for spacing + an absolutely-positioned circle on top) both structurally and visually.

Not replicated: the OS "Gesture bar" / home-indicator strip shown in the Figma mockup (white 24px bar with a centered handle) — that's normally rendered by the OS itself, not app content, so there's nothing to build here.

## Website Footer (sections `2295:1370`, and standalone frames `2295:1480`/`2295:1528`) — not applicable

Figma includes a full marketing-site footer (~3 layout variants: "Footer Dark," "Footer Light" with Homepage/Account-Dashboard states, and a "Footer v1" with a 4-column link grid) — logo + address, quick links (About Us / Our Services / Become Saathi / Contact Us), social icons (Facebook/Twitter/Instagram/LinkedIn/YouTube), a "scroll to top" arrow button, and copyright/legal-links content.

Not touched or catalogued in detail: this project is a React Native mobile app with no web surface, so a marketing-site footer doesn't apply. If a companion website is ever built, revisit node `2295:1370` for the full spec (logo/address block, quick-links columns, social icon row, copyright bar).
