import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import storageClient from '../services/storage';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: 'care_seeker' | 'care_giver' | null;
  age: string;
}

interface UserState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  clearProfile: () => void;
}

const customPersistStorage = {
  getItem: (name: string) => storageClient.getItem(name),
  setItem: (name: string, value: string) => storageClient.setItem(name, value),
  removeItem: (name: string) => storageClient.removeItem(name),
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      updateProfile: (updatedFields) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updatedFields } : null,
        })),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: 'servesaathi-user',
      storage: createJSONStorage(() => customPersistStorage),
    }
  )
);
export default useUserStore;
