# Header / Status Bar — Figma spec reference

Source: Figma "Serve Saathi — Design System", node `2017:6711` ("❖ Header / Status Bar").

Captured for future implementation. The mobile app header variants below are already implemented in [`src/components/layouts/Header.tsx`](../../src/components/layouts/Header.tsx) — kept here for cross-reference only. Everything under "Not yet implemented" has no corresponding code yet.

## Already implemented (mobile app header — `Header.tsx`)

Common container: `paddingTop: 16, paddingBottom: 8, paddingHorizontal: 24`, background `background.layout` (#EAF2EA), nav icon buttons are 40×40 circles, `primary-color/primary` (#2E7D32) background, white 24×24 icon.

- **Headline** (node `2017:8476`): left icon + centered title, right icon. Title style = Headings/H2 (Atkinson Hyperlegible Next Semi-bold, 22px/30px, `neutral/primary` #1E1B18).
- **Off text** (node `2017:8492`): left icon + right icon only, no center content (title optional/hidden).
- **Logo** (node `2017:8508`): left icon + centered wordmark (135×36 in Figma; `Header.tsx` renders it at 120×32) + right icon.
- **Progress Indicator** (node `2017:8525`): left icon, then immediately to its right a step-dash group + "`n` of `total`" text (NOT centered, NOT on the right). 6 dashes, each 24×4px, `borderRadius:2`. Active dash = `tertiary` (#FF751F), inactive = `vividOrange[200]` (#FFC8A5). Label = Body/Small (14px/20px regular), color `primary` (#2E7D32). Right icon typically hidden in this style.

## Not yet implemented

### Status bar (OS mockup reference only — not actionable, iOS/Android own the real status bar)
- Frame `2017:8203`, two modes:
  - `Mode=Off` (node `2017:8204`): light background, time text `neutral/primary` (#1E1B18), 44px tall, `px-24 py-10`.
  - `Mode=On` (node `2017:8219`, dark mode): same layout, time text `neutral/primary-inverse` (white).
  - Both show time "9:30", wifi/signal/battery icons (right-aligned, 17px), camera cutout (24px, centered).
- Not implemented since the real device status bar isn't app-drawable content; kept only as a design reference.

### Pop up Headline Bar (node `2026:12090`)
- Layout: `flex items-center justify-between`, width 328px.
- Left: centered text, Headings/H3 style (Atkinson Hyperlegible Next Semi-bold, 20px, lineHeight 30px), color `neutral/primary` (#1E1B18). Example text: "15 April 2026".
- Right: 40×40 circular button, `primary-color/primary` (#2E7D32) background, white close (X) icon, 24×24.
- Likely use case: a modal/bottom-sheet header bar (e.g. date picker, filter sheet) — no corresponding component exists yet in `src/components`.

### Header Navigation — website/desktop (node `2311:1058`, section `2295:1033`)
Not applicable to the current React Native mobile app; would only matter if a companion web/admin surface is built.

- **Mobile web header** (`Header contents mobile`, node `2311:1062`): height 80px, `px-48`, white background, bottom border `forest-green/50` (#EAF2EA) 1.5px.
  - Left: Primary Logo (English, Colors), 149.7×40.
  - Right: a 40×40 `primary-color/primary` square button (rounded 6px, not circular — likely a menu/hamburger trigger), icon not resolved in this export.
- **Desktop web header** (`Header contents desktop`, node `2311:1065`): height 80px, `px-80 py-20`.
  - Left: Primary Logo (English, Colors), natural size.
  - Right: `Container` (gap 48px) containing:
    - **Menu items** (node `2311:1068`, gap 48px): "Home", "Services", "Profile", "Settings" — Body/Large style (Atkinson Hyperlegible Next Regular, 16px/22px), color `neutral/secondary` (#4B4946). (A 5th item exists but is hidden in the design.)
    - **Search input** (node `2311:1075`, 240×40): white bg, border `background/g-line` (#D5E5D6) 1.5px, `borderRadius:10`, `padding: 14px 20px 14px 16px`. Contains a 24px search icon + "Search" placeholder text (DM Sans Regular 16px/24px, color `neutral/tertiary` #787674). Note: placeholder font is **DM Sans**, not Atkinson Hyperlegible — a one-off in this design.
    - **Notification button**: 40×40 circle, `primary-color/primary` (#2E7D32) bg, white bell icon.
    - **Profile photo**: 40×40 circular avatar image.
    - **Profile name**: "Kamala Sharma", Headings/H3 style (20px/30px, semi-bold), color `primary-color/primary` (#2E7D32) — name rendered in brand green, not neutral black.
  - Additional documented states not fetched in detail (symbol names only, from metadata): `Device=Desktop, Status=Dashboard` (`2311:1120`), `Device=Mobile, Status=Dashboard` (`2311:1190`), `Device=Mobile, Status=Homepage` (`2295:527`), `Device=Desktop, Status=Step Process` (`2349:1045`) — likely small content/state variations on the same header shell (e.g. active nav item highlighting). Not pulled since there's no web surface to build against yet.

## Open questions for later
- What triggers the "Pop up Headline Bar"? No usage context found elsewhere in the file yet.
- Is a web/admin surface actually planned? If not, the "Header Navigation" section can probably be deprioritized entirely.
- The mobile-web header's right-side button icon wasn't resolved by the export (asset link returned but not decoded) — re-fetch node `2311:1064` specifically if/when this becomes relevant.
