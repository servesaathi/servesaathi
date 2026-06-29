import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import storageClient from '../services/storage';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string | null) => void;
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
      setToken: (token) => set({ token, isAuthenticated: !!token }),
      logout: () => set({ token: null, isAuthenticated: false }),
    }),
    {
      name: 'servesaathi-auth',
      storage: createJSONStorage(() => customPersistStorage),
    }
  )
);
export default useAuthStore;
