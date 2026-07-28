import { useCallback, useEffect, useRef, useState } from 'react';
import { isSpeechRecognitionAvailable, speak, startListening } from '@/services/voice';
import { parseVoiceCommand, type VoiceCommand } from '@/utils/voiceCommandParser';

export type { VoiceCommand };

interface UseVoiceCommandsOptions {
  enabled: boolean;
  onCommand: (command: VoiceCommand) => void;
}

// One-shot listening sessions: press the mic, say a command, recognition ends
// itself. `available` is false in Expo Go (native speech module not linked).
export const useVoiceCommands = ({ enabled, onCommand }: UseVoiceCommandsOptions) => {
  const [listening, setListening] = useState(false);
  const [available] = useState(isSpeechRecognitionAvailable);
  const cleanupRef = useRef<(() => void) | null>(null);
  const onCommandRef = useRef(onCommand);
  onCommandRef.current = onCommand;

  const stop = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    setListening(false);
  }, []);

  useEffect(() => {
    if (!enabled) stop();
    return stop;
  }, [enabled, stop]);

  const startVoiceInput = useCallback(async () => {
    if (!available || listening) return;
    setListening(true);
    const cleanup = await startListening({
      onResult: (transcript) => {
        const command = parseVoiceCommand(transcript);
        if (command) {
          onCommandRef.current(command);
        } else {
          speak(`I heard "${transcript}", but I don't know that command. Say help to hear the options.`);
        }
      },
      onEnd: () => stop(),
      onError: (message) => {
        speak(message);
        stop();
      },
    });
    if (!cleanup) {
      setListening(false);
      return;
    }
    cleanupRef.current = cleanup;
  }, [available, listening, stop]);

  return { available, listening, startVoiceInput, stopVoiceInput: stop };
};
