import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import storageClient from '../services/storage';

// 0 = small, 1 = medium (default), 2 = large — mirrors the 3-stop slider on the
// Accessibility screen. The multiplier is applied to every explicit fontSize by
// the global Text patch in src/utils/textAccessibility.tsx.
export type FontSizeLevel = 0 | 1 | 2;

export const FONT_SCALE_MULTIPLIERS: Record<FontSizeLevel, number> = {
  0: 0.875,
  1: 1,
  2: 1.2,
};

interface AccessibilityState {
  fontSizeLevel: FontSizeLevel;
  setFontSizeLevel: (level: FontSizeLevel) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  voiceCommandsEnabled: boolean;
  setVoiceCommandsEnabled: (enabled: boolean) => void;
}

const customPersistStorage = {
  getItem: (name: string) => storageClient.getItem(name),
  setItem: (name: string, value: string) => storageClient.setItem(name, value),
  removeItem: (name: string) => storageClient.removeItem(name),
};

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      fontSizeLevel: 1,
      setFontSizeLevel: (fontSizeLevel) => set({ fontSizeLevel }),
      highContrast: false,
      setHighContrast: (highContrast) => set({ highContrast }),
      voiceCommandsEnabled: false,
      setVoiceCommandsEnabled: (voiceCommandsEnabled) => set({ voiceCommandsEnabled }),
    }),
    {
      name: 'servesaathi-accessibility',
      storage: createJSONStorage(() => customPersistStorage),
    }
  )
);

export default useAccessibilityStore;
