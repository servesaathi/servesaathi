import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import storageClient from '../services/storage';
import { ApiRole } from '../api/types';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  /** True while the user is browsing without an account (Onboarding → "Get Started").
   *  Cleared once they authenticate for real or log out. */
  isGuest: boolean;
  /** Role chosen on the Join screen, sent with OTP requests. */
  role: ApiRole;
  /** E.164 phone the OTP was sent to, e.g. "+919777729450". */
  phone: string | null;
  /** Short-lived token returned by OTP verify, consumed by registration. */
  phoneVerificationToken: string | null;
  isNewUser: boolean | null;
  /**
   * STOPGAP until the backend has a phone-only quick-registration endpoint:
   * a guest who verifies a brand-new number (via GuestBrowseServicesScreen,
   * LeadCaptureModal, or UnlockComparisonSheet) has their name+phone saved
   * locally and this flips true, so the UI treats them as done — no real
   * account/token exists server-side, so this deliberately does NOT touch
   * `token`/`isAuthenticated` (which would send a fake bearer token on real
   * API calls). Swap the frontend-only save for a real register() call, and
   * this flag goes away, once that endpoint ships — see guestVerification.ts.
   */
  isLocallyRegistered: boolean;
  setToken: (token: string | null) => void;
  setGuest: (isGuest: boolean) => void;
  setRole: (role: ApiRole) => void;
  setPhone: (phone: string | null) => void;
  setPhoneVerification: (data: { phoneVerificationToken?: string; isNewUser: boolean }) => void;
  setLocallyRegistered: (value: boolean) => void;
  logout: () => void;
}

const customPersistStorage = {
  getItem: (name: string) => storageClient.getItem(name),
  setItem: (name: string, value: string) => storageClient.setItem(name, value),
  removeItem: (name: string) => storageClient.removeItem(name),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      isGuest: false,
      role: 'customer',
      phone: null,
      phoneVerificationToken: null,
      isNewUser: null,
      isLocallyRegistered: false,
      // A real token always wins over guest mode.
      setToken: (token) => set(token ? { token, isAuthenticated: true, isGuest: false } : { token: null, isAuthenticated: false }),
      setGuest: (isGuest) => set({ isGuest }),
      setRole: (role) => set({ role }),
      setPhone: (phone) => set({ phone }),
      setPhoneVerification: ({ phoneVerificationToken, isNewUser }) =>
        set({ phoneVerificationToken: phoneVerificationToken ?? null, isNewUser }),
      setLocallyRegistered: (value) => set({ isLocallyRegistered: value }),
      logout: () =>
        set({
          token: null,
          isAuthenticated: false,
          isGuest: false,
          phone: null,
          phoneVerificationToken: null,
          isNewUser: null,
          isLocallyRegistered: false,
        }),
    }),
    {
      name: 'servesaathi-auth',
      storage: createJSONStorage(() => customPersistStorage),
    }
  )
);
/**
 * "Done verifying" for gating purposes — a real account (isAuthenticated) or
 * the frontend-only stopgap save (isLocallyRegistered, see the field's doc
 * comment above). Screens that decide whether to show the guest unlock popup
 * again should read this instead of isAuthenticated alone.
 */
export const useIsGuestVerified = (): boolean =>
  useAuthStore((s) => s.isAuthenticated || s.isLocallyRegistered);

export default useAuthStore;
