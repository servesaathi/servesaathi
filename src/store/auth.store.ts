import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import storageClient from '../services/storage';
import { ApiRole } from '../api/types';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  /** Role chosen on the Join screen, sent with OTP requests. */
  role: ApiRole;
  /** E.164 phone the OTP was sent to, e.g. "+919777729450". */
  phone: string | null;
  /** Short-lived token returned by OTP verify, consumed by registration. */
  phoneVerificationToken: string | null;
  isNewUser: boolean | null;
  setToken: (token: string | null) => void;
  setRole: (role: ApiRole) => void;
  setPhone: (phone: string | null) => void;
  setPhoneVerification: (data: { phoneVerificationToken: string; isNewUser: boolean }) => void;
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
      role: 'customer',
      phone: null,
      phoneVerificationToken: null,
      isNewUser: null,
      setToken: (token) => set({ token, isAuthenticated: !!token }),
      setRole: (role) => set({ role }),
      setPhone: (phone) => set({ phone }),
      setPhoneVerification: ({ phoneVerificationToken, isNewUser }) =>
        set({ phoneVerificationToken, isNewUser }),
      logout: () =>
        set({
          token: null,
          isAuthenticated: false,
          phone: null,
          phoneVerificationToken: null,
          isNewUser: null,
        }),
    }),
    {
      name: 'servesaathi-auth',
      storage: createJSONStorage(() => customPersistStorage),
    }
  )
);
export default useAuthStore;
