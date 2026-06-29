import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';

let mmkvStorage: any = null;

try {
  // Determine if running inside Jest
  const isJest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';

  // Check if we are running inside Expo Go
  const isExpoGo =
    isJest ||
    Constants?.executionEnvironment === ExecutionEnvironment.StoreClient ||
    (typeof globalThis !== 'undefined' &&
      ((globalThis as any).expo !== undefined ||
        (globalThis as any).__expo_device_info !== undefined ||
        (globalThis as any).__expo !== undefined));

  if (!isExpoGo) {
    // Dynamic require to prevent compile-time module crashes in Expo Go
    const { createMMKV } = require('react-native-mmkv');
    mmkvStorage = createMMKV({
      id: 'servesaathi-storage',
    });
  } else {
    console.log('Running in Expo Go/Jest: disabling MMKV and using AsyncStorage');
  }
} catch (e) {
  console.log('MMKV native bindings not found, using AsyncStorage fallback');
}

export interface StorageService {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

export const storage: StorageService = {
  getItem: async (key: string): Promise<string | null> => {
    if (mmkvStorage) {
      try {
        return mmkvStorage.getString(key) ?? null;
      } catch (e) {
        return AsyncStorage.getItem(key);
      }
    }
    return AsyncStorage.getItem(key);
  },
  
  setItem: async (key: string, value: string): Promise<void> => {
    if (mmkvStorage) {
      try {
        mmkvStorage.set(key, value);
        return;
      } catch (e) {
        return AsyncStorage.setItem(key, value);
      }
    }
    return AsyncStorage.setItem(key, value);
  },

  removeItem: async (key: string): Promise<void> => {
    if (mmkvStorage) {
      try {
        mmkvStorage.remove(key);
        return;
      } catch (e) {
        return AsyncStorage.removeItem(key);
      }
    }
    return AsyncStorage.removeItem(key);
  },

  clear: async (): Promise<void> => {
    if (mmkvStorage) {
      try {
        mmkvStorage.clearAll();
        return;
      } catch (e) {
        return AsyncStorage.clear();
      }
    }
    return AsyncStorage.clear();
  }
};

export default storage;
