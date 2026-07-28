import * as Speech from 'expo-speech';

// Voice layer for accessibility. Text-to-speech (expo-speech) works everywhere
// including Expo Go. Speech-to-text needs the expo-speech-recognition native
// module, which is only present in a development/production build — in Expo Go
// the require throws, so we degrade to TTS-only guidance.

type EventSubscription = { remove: () => void };

interface SpeechRecognitionModule {
  requestPermissionsAsync: () => Promise<{ granted: boolean }>;
  start: (options: Record<string, unknown>) => void;
  stop: () => void;
  abort: () => void;
  isRecognitionAvailable: () => boolean;
  addListener: (eventName: string, listener: (event: any) => void) => EventSubscription;
}

let recognitionModule: SpeechRecognitionModule | null = null;
try {
  // Throws inside Expo Go where the native module is not linked.
  recognitionModule = require('expo-speech-recognition').ExpoSpeechRecognitionModule;
} catch {
  recognitionModule = null;
}

export const isSpeechRecognitionAvailable = (): boolean => {
  try {
    return !!recognitionModule && recognitionModule.isRecognitionAvailable();
  } catch {
    return false;
  }
};

export const speak = (text: string): void => {
  Speech.stop();
  Speech.speak(text, { language: 'en-IN' });
};

export const stopSpeaking = (): void => {
  Speech.stop();
};

export interface ListenCallbacks {
  onResult: (transcript: string) => void;
  onEnd: () => void;
  onError: (message: string) => void;
}

// Starts a single listening session; resolves to a cleanup function, or null
// when recognition is unavailable / permission was denied.
export const startListening = async (callbacks: ListenCallbacks): Promise<(() => void) | null> => {
  if (!recognitionModule) return null;
  const { granted } = await recognitionModule.requestPermissionsAsync();
  if (!granted) {
    callbacks.onError('Microphone permission was denied.');
    return null;
  }

  const subscriptions: EventSubscription[] = [
    recognitionModule.addListener('result', (event: any) => {
      const transcript: string | undefined = event?.results?.[0]?.transcript;
      if (event?.isFinal && transcript) callbacks.onResult(transcript);
    }),
    recognitionModule.addListener('end', () => callbacks.onEnd()),
    recognitionModule.addListener('error', (event: any) => {
      callbacks.onError(event?.message ?? 'Could not understand, please try again.');
    }),
  ];

  recognitionModule.start({ lang: 'en-IN', interimResults: false, continuous: false });

  return () => {
    subscriptions.forEach((s) => s.remove());
    try {
      recognitionModule?.abort();
    } catch {
      /* already stopped */
    }
  };
};
