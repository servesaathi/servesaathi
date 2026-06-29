import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import storageClient from '../services/storage';

interface AppState {
  isSplashVisible: boolean;
  setSplashVisible: (visible: boolean) => void;
  networkConnected: boolean;
  setNetworkConnected: (connected: boolean) => void;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
}

const customPersistStorage = {
  getItem: (name: string) => storageClient.getItem(name),
  setItem: (name: string, value: string) => storageClient.setItem(name, value),
  removeItem: (name: string) => storageClient.removeItem(name),
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isSplashVisible: true,
      setSplashVisible: (visible) => set({ isSplashVisible: visible }),
      networkConnected: true,
      setNetworkConnected: (connected) => set({ networkConnected: connected }),
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'servesaathi-app',
      storage: createJSONStorage(() => customPersistStorage),
    }
  )
);

export default useAppStore;
