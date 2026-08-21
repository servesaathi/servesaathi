# Sidebar — Figma spec reference

Source: Figma "Serve Saathi — Design System", node `168:6381` ("❖ Sidebar"). Despite the name, this isn't a persistent nav rail — it's a fixed-width (220px) desktop panel pattern used two ways: a settings menu and a service filter panel. Adapted both into mobile-appropriate layouts rather than literal narrow sidebars.

## Built

- **`SettingsMenuItem`** (`src/components/layouts/SettingsMenuItem.tsx`) — adapted from "Sidebar Base" (node `2324:582`, On/Off states): icon + label row, with an active state (orange-tinted background, orange text) matching Figma's highlighted "Edit Profile" example. Converted from a fixed 174px-wide desktop item into a full-width mobile row.
- **`SettingsScreen`** (`src/features/settings/screens/SettingsScreen.tsx`) — the actual content from "Sidebar for Settings" (node `2324:777`): 3 grouped sections exactly as specified —
  - **Account**: Edit Profile, Change Password, Payment Method
  - **General**: Language, Accessibility, Privacy Data, Notification
  - **Support**: Report an issue, Help & Support, Delete Account, Log out

  Wired into `BottomTabNavigator.tsx`, replacing the "Setting Screen (Coming Soon)" placeholder that was there before. Group headers use `theme.typography.h4` in `primary` green, matching Figma's `Headings/H4` green section titles.

  Icons mapped from the existing `Icon` set (`profile`, `key`, `payment`, `language`, `accessibility`, `safety`, `notification`, `error`, `help`, `delete`, `signOut`) — all were already available, no new icon extraction needed.

  "Log out" is wired to reset navigation back to the `Login` screen. Every other item's `onPress` is left `undefined` (no-op) since their destination screens (Edit Profile, Change Password, Payment Method, Language settings, Accessibility settings, Privacy Data, Notification settings, Report an issue, Help & Support, Delete Account) don't exist yet — building those screens is well beyond the scope of this sidebar-design pass.

## Not built — reuses existing components, just not assembled

**"Fiter by - Services"** (node `2355:917`) — a filter panel for a services marketplace/browse screen (Ratings, Monthly Budget Range, Urgency, Type of Service, Language — each a labeled group of options). Good news: every option row in this panel is visually identical to the `SelectableChip` component already built during the Inputs & Forms pass — same label + embedded orange checkbox pattern, same colors. No new atomic component needed.

Not assembled into a real filter panel/screen because there's no actual "browse services" feature to attach it to yet — `ServiceScreen` in `BottomTabNavigator.tsx` is still a "Coming Soon" placeholder. Once that feature exists, building this panel is just: section labels (`Headings/H5`, with a red required asterisk) + a `SelectableChip` list per group, all wrapped in a scroll view — no new visual work required.
