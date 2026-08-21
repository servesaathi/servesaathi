import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import storageClient from '../services/storage';

// Body-text bounds for the Accessibility screen's slider — the default
// (16pt) ± 3pt, so it drags continuously between 13pt "smallest" and 19pt
// "largest" in 0.5pt steps (FONT_SIZE_STEP in AccessibilityScreen.tsx).
// Nothing can push it outside the range, here or from voice commands.
export const FONT_SIZE_MIN = 13;
export const FONT_SIZE_MAX = 19;
// 16pt is the app's base body size (theme.typography.bodyLarge) — multiplier 1×,
// i.e. the original design's default text size before any scaling is applied.
export const FONT_SIZE_DEFAULT = 16;

// Half-point granularity to match the slider's 0.5pt-per-step feel — a plain
// Math.round() would snap every drag to whole points and the step would be
// invisible.
const clampFontSize = (size: number): number =>
  Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, Math.round(size * 2) / 2));

interface AccessibilityState {
  // Absolute point size the slider is set to (13–19), not a multiplier — the
  // multiplier every screen actually applies (src/utils/textAccessibility.tsx)
  // is derived as fontSize / FONT_SIZE_DEFAULT.
  fontSize: number;
  setFontSize: (size: number) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  voiceCommandsEnabled: boolean;
  setVoiceCommandsEnabled: (enabled: boolean) => void;
  // Restores font size, contrast, and voice commands to their factory values
  // in one step — the Accessibility screen's "Reset to Default" action.
  resetToDefaults: () => void;
}

const customPersistStorage = {
  getItem: (name: string) => storageClient.getItem(name),
  setItem: (name: string, value: string) => storageClient.setItem(name, value),
  removeItem: (name: string) => storageClient.removeItem(name),
};

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      fontSize: FONT_SIZE_DEFAULT,
      setFontSize: (fontSize) => set({ fontSize: clampFontSize(fontSize) }),
      highContrast: false,
      setHighContrast: (highContrast) => set({ highContrast }),
      voiceCommandsEnabled: false,
      setVoiceCommandsEnabled: (voiceCommandsEnabled) => set({ voiceCommandsEnabled }),
      resetToDefaults: () =>
        set({ fontSize: FONT_SIZE_DEFAULT, highContrast: false, voiceCommandsEnabled: false }),
    }),
    {
      name: 'servesaathi-accessibility',
      storage: createJSONStorage(() => customPersistStorage),
      // Older installs persisted the 3-stop `fontSizeLevel` (0/1/2) instead of
      // a continuous `fontSize` point value — migrate it forward once so
      // upgrading users keep their preference instead of silently resetting.
      //
      // version 2: the slider's bounds were tightened from 12–28pt to
      // 14–26pt.
      // version 3: tightened again to a symmetric default±3pt (13–19pt) with
      // 0.5pt steps, replacing the old 1pt-step 14–26pt range. Bumping the
      // version re-runs this migration for everyone on an older build, so a
      // value saved under a wider range (e.g. a leftover 26pt) gets pulled
      // back in-bounds and onto the half-point grid instead of silently
      // overshooting the new max forever.
      version: 3,
      migrate: (persisted: any) => {
        if (persisted && typeof persisted.fontSize !== 'number' && typeof persisted.fontSizeLevel === 'number') {
          const legacyMultiplier = [0.875, 1, 1.2][persisted.fontSizeLevel] ?? 1;
          persisted.fontSize = FONT_SIZE_DEFAULT * legacyMultiplier;
        }
        if (persisted && typeof persisted.fontSize === 'number') {
          persisted.fontSize = clampFontSize(persisted.fontSize);
        }
        return persisted;
      },
    }
  )
);

export default useAccessibilityStore;
