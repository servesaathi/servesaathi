# Tabs — Figma spec reference

Source: Figma "Serve Saathi — Design System", node `2019:10526` ("❖ Tabs"). A segmented-control switcher ("Switch Label"), not a navigation tab bar — no existing component matched this pattern.

## Built

**`SegmentedTabs`** (`src/components/layouts/SegmentedTabs.tsx`), two variants:

- **`filled`** (Figma "Style=Tabs") — orange track (`tertiary`), rounded 8, 44px tall. Active segment renders as a white pill with orange text; inactive segments are transparent with white text. Works for both the 2-tab (nodes `2019:10529`/`2019:10536`) and 3-tab (`2171:11`/`2171:20`/`2171:27`) variants — same component, just pass more `options`. Also supports the floating green "Discount %" badge (e.g. "Save 25%") seen in the 2-tab pricing-plan example, via an optional `badge={{ index, label }}` prop.
- **`plain`** (Figma "Style=Without Tab," node `2288:59`) — a simpler underlined switcher: translucent green top/bottom border, vertical dividers between segments, uppercase small-caption labels (e.g. "FILTER BY | SORT BY"). Figma's example only shows a "Default" state with no distinct active treatment for any segment, so I added a reasonable active state (primary green + semi-bold) by inference — not a literal Figma spec, since none was shown. Worth double-checking against the design file if a true active/selected look exists elsewhere.

## Not wired into any screen

Same caveat as some other recent builds: `SegmentedTabs` isn't used anywhere yet — no screen currently needs a 2/3-way switcher or a filter/sort toggle. Ready to drop in wherever one comes up (e.g. a pricing/plan comparison screen for the `filled` variant, or a list screen's filter/sort header for the `plain` variant).
