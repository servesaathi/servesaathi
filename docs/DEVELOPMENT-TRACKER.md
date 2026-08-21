# ServeSaathi — Screen Development Tracker

Source of truth: Figma "Serve Saathi - UI - UX" (`dreRLvM7kEty4p5sNhup0I`), page
"🟢 High Fidelity APP v1 (26/05)" (node `937:13310`). Every screen below lists its
Figma node ID so the exact frame can be pulled without re-scanning the file.

Legend: ✅ built & design-checked · 🔨 in progress · ⬜ not started

## 1. Start an app (new-user journey) — section `1247:24233`

| # | Screen | Figma node | Status | Code |
|---|--------|-----------|--------|------|
| 1 | Splash | `1247:24283` | ✅ | `features/auth/screens/SplashScreen.tsx` |
| 2 | Language | `1247:24234` | ✅ | `features/auth/screens/LanguageSelectScreen.tsx` |
| 3 | Onboarding ×3 | `1247:24272/24248/24260` | ✅ | `features/auth/screens/OnboardingScreen.tsx` |
| 4 | Join (Choose a role) | `1248:40910` | ✅ | `features/auth/screens/RoleSelectionScreen.tsx` |
| 5 | Mobile Phone Verify | `1248:40926` | ✅ | `features/auth/screens/LoginScreen.tsx` |
| 6 | OTP Verification (+input) | `1248:40948/40964` | ✅ | `features/auth/screens/OTPScreen.tsx` |
| 7 | Create Account (+input) | `1248:41009` / `1432:37592` | ✅ | `features/auth/screens/CreateAccountScreen.tsx` |
| 8 | Permission | `1248:40995` | ✅ | `features/auth/screens/PermissionScreen.tsx` |
| 9 | Profile Creation 1a/1b | `1248:44068/44150` | ✅ | `features/profileCreation/screens/ProfileSetupScreen.tsx` |
| 10 | Profile Creation 2a/2b (Address) | `1248:44227/44255` | ✅ | `features/profileCreation/screens/AddressScreen.tsx` |
| 11 | Profile Creation 3a (Health) | `1248:44732` | ✅ | `features/profileCreation/screens/HealthInfoScreen.tsx` |
| 12 | Profile Creation 4 (Interests) | `1248:44337` | ✅ | `features/profileCreation/screens/InterestsScreen.tsx` |
| 13 | Profile Creation 5a–5d (Circle of Care) | `1248:44491/44283/44310/44544` | ✅ | `features/profileCreation/screens/CircleOfCareScreen.tsx` |
| 14 | Profile Creation 6a (Accessibility) | `1248:44362` | ✅ | `features/profileCreation/screens/AccessibilityScreen.tsx` |
| 15 | Subscription | `1248:44406` | ✅ | `features/payments/screens/SubscriptionScreen.tsx` |
| 16 | Payment method (+filled 1a) | `1248:44424/44451` | ✅ | `features/payments/screens/PaymentMethodScreen.tsx` |
| 17 | Setting up | `1248:44478` | ✅ | `features/profileCreation/screens/SettingUpScreen.tsx` |
| 18 | Home | `1248:44660` | ✅ | `features/home/screens/HomeScreen.tsx` |
| 19 | Request Send popup | `1248:44605` | ⬜ | — |
| 20 | Notification popups ×2 | `1248:44619/44642` | ⬜ | — |

## 2. Services — section `1255:26744` (~22 screens)

| Screen | Figma node | Status | Code (`features/services/screens/`) |
|--------|-----------|--------|------|
| Our Service - My Services | `1255:26894` | ✅ | `ServicesScreen.tsx` |
| Our Service - All Services | `1255:26926` | ✅ | `ServicesScreen.tsx` |
| Infrastructure | `1256:23704` | ✅ | `ServicesScreen.tsx` (sheet) |
| Personalized Question 1–5 | `1256:23745/23825/23785/23864/23918` | ✅ | `PersonalizedQuestionsScreen.tsx` |
| Caregiver training (list) | `1256:24028` | ✅ | `CaregiverListScreen.tsx` |
| Filter by / Sort by | `1256:23970` / `1256:24175` | ✅ | `CaregiverListScreen.tsx` (sheets) |
| Compare Close / Expand 1–3 | `1256:24118/24061/24210/24269` | ✅ (Close; Expand drawer simplified) | `CaregiverListScreen.tsx` |
| Comparison | `1256:24299` | ✅ | `ComparisonScreen.tsx` |
| Caregivers - About / Reviews | `1256:24506` / `1256:24595` | ✅ | `CaregiverDetailScreen.tsx` |
| Request Set up / Request Details | `1256:24696` / `1256:24795` | ✅ | `RequestSetupScreen.tsx` / `RequestDetailsScreen.tsx` |
| Home (services variant) | `1256:35799` | ⬜ (Home with populated services — needs data wiring) |

## 3. Existing User (returning login) — section `1248:46780` (~15 screens)

| Screen | Figma node | Status |
|--------|-----------|--------|
| Mobile Phone Verify | `1248:47050` | ⬜ |
| OTP Verification (+input) | `1248:47034/46988` | ⬜ |
| Enter Email (+input) | `1248:47008/47021` | ⬜ |
| Forgot-password: Enter Email ×4 | `1257:23303/23864/24311/24793` | ⬜ |
| Forgot-password: Enter Mobile | `1257:24191` | ⬜ |
| Forgot-password: OTP ×2 | `1257:23316/24412` | ⬜ |
| New Password | `1257:24462` | ⬜ |
| Home (returning) | `1249:47700` | ⬜ |
| Mood/Feeling Tracker | `1249:47732` | ⬜ |

## 4. Emergency Support (Helpline) — section `1380:37923` (6 screens)

UI built with mock data (`features/emergency/data.ts`) — location sharing and org detail
lookups aren't wired to a backend yet since those APIs don't exist. Real bits: the
`expo-location` permission prompt + device position/reverse-geocode on Share Location
(same pattern as `AddressScreen`), and a real `tel:` dial on the Emergency SOS button.

| Screen | Figma node | Status | Code (`features/emergency/screens/`) |
|--------|-----------|--------|------|
| Helpline (tab home: SOS + Quick Actions) | `1317:8136` | ✅ (UI, mock) | `HelplineHomeScreen.tsx` |
| Helpline (org list) | `1376:16867` | ✅ (UI, mock) | `HelplineListScreen.tsx` |
| Share Location | `1372:8432` | ✅ (UI, real permission + mock contacts/share) | `ShareLocationScreen.tsx` |
| EM Responder | `1376:17625` | ✅ (UI, mock) | `EMResponderScreen.tsx` |
| Support Chat ×2 | `1376:19257/19328` | ✅ (UI, mock canned replies) | `SupportChatScreen.tsx` |

## 5. Track Request — section `1380:37924` (4 screens)

| Screen | Figma node | Status |
|--------|-----------|--------|
| Request Details | `1379:36797` | ⬜ |
| Home (tracking variant) | `1379:37253` | ⬜ |
| Our Service - All Services | `1379:37476` | ⬜ |
| Cancel popup | `1379:37703` | ⬜ |

## 6. Profile Account — section `1426:55879` (3 screens)

| Screen | Figma node | Status |
|--------|-----------|--------|
| Profile - Basic Info | `1426:55259` | ⬜ |
| Profile - Medical | `1424:50456` | ⬜ |
| Profile - History | `1426:55471` | ⬜ |

## 7. Settings — section `1432:40304` (~17 screens)

Settings root rebuilt against the real Figma frame (was a rough unvalidated placeholder).
`SettingsMenuItem` (`components/layouts/`) now renders the actual "Field Card View" — icon
circle (28px glyph) + label + chevron, colored left-border in 3 variants (orange default /
red danger / green safe) — reused for every menu row. Profile card uses the exact Figma
background SVG (`assets/illustrations/settings_profile_card_bg.svg`) and shows real data —
name from the auth store, age/gender/avatar from `careProfileService.getCareProfile()`
(falls back to a mock photo if `avatarUrl` isn't set, since real profile photos aren't
uploaded anywhere yet). Settings + Edit Profile now live in a nested `SettingsStackNavigator`
(mirrors `HelplineStackNavigator`) so the bottom tab bar stays visible on both, matching Figma.
Added `userService` (`PATCH /users/me`, previously undocumented in the frontend) for
name/phone edits, and a shared `ageFromDob` util (was duplicated in ProfileScreen).

| Screen | Figma node | Status | Code |
|--------|-----------|--------|------|
| Settings (root) | `1432:38979` | ✅ | `features/settings/screens/SettingsScreen.tsx` |
| Account Profile (Edit Profile) | `1432:39176` | ✅ (UI + real name/phone save; photo picker is real but preview-only — no avatar-upload endpoint yet) | `features/settings/screens/EditProfileScreen.tsx` |
| Accessibility | `1432:39001` | ⬜ |
| Privacy Data | `1432:39043` | ⬜ |
| Notification ×3 | `1432:39102` / `1976:39504` / `1976:39716` | ⬜ |
| Payment method 1a/1b ×3 | `1432:39118/39153` / `1594:11803` | ⬜ |
| Payment method 1b - Filter by | `1594:11964` | ⬜ |
| Change Password | `1432:39196` | ⬜ |
| Language | `1432:39213` | ⬜ |
| Help & Support | `1432:39232` | ⬜ |
| Delete account popup | `1432:39248` | ⬜ |
| Log out popup | `1432:39266` | ⬜ |

## 8. Wallet Payment — section `1432:52401` (3 screens)

| Screen | Figma node | Status |
|--------|-----------|--------|
| Wallet & Payments - Payments | `1449:10672` | ⬜ |
| Wallet & Payments - Transactions | `1457:11154` | ⬜ |
| Filter by | `1457:13420` | ⬜ |

## 9. Notifications Center — section `1432:52456` (2 screens)

UI built with mock data (`features/notifications/data.ts`) — single screen toggling
empty/populated states based on data, same pattern as Support Chat. Reached via the
bell icon on the Helpline tab home screen; nested in `HelplineStackNavigator` so the
bottom tab bar stays visible, matching the Figma frames.

| Screen | Figma node | Status | Code |
|--------|-----------|--------|------|
| Notification (empty + populated) | `1445:12356` / `1445:12601` | ✅ (UI, mock) | `features/notifications/screens/NotificationsScreen.tsx` |

## 10. Subscription Plans — section `1432:52471` (1 screen)

| Screen | Figma node | Status |
|--------|-----------|--------|
| Subscription Plans | inside `1432:52472` | ⬜ |

---

### Build order (agreed)

1. ✅ Start an app: auth + Profile Creation wizard
2. 🔨 Start an app: Subscription → Payment → Home (completes new-user journey)
3. ⬜ Services
4. ⬜ Existing User login
5. ⬜ Settings
6. ⬜ Emergency Support → Track Request → Profile Account → Wallet → Notifications → Subscription Plans
