export type VoiceCommand =
  | { type: 'fontUp' }
  | { type: 'fontDown' }
  | { type: 'contrast'; high: boolean }
  | { type: 'continue' }
  | { type: 'help' };

// Maps a free-form transcript ("make the text bigger please") to an app command.
export const parseVoiceCommand = (transcript: string): VoiceCommand | null => {
  const text = transcript.toLowerCase();
  if (/(help|what can i say)/.test(text)) return { type: 'help' };
  if (/(continue|next|proceed|submit|done|save)/.test(text)) return { type: 'continue' };
  if (/high\s*contrast|dark\s*(mode|theme)|more\s*contrast|increase\s*contrast/.test(text)) {
    return { type: 'contrast', high: true };
  }
  if (/normal\s*contrast|regular\s*contrast|less\s*contrast|decrease\s*contrast|light\s*(mode|theme)/.test(text)) {
    return { type: 'contrast', high: false };
  }
  if (/(bigger|larger|increase|bada)/.test(text)) return { type: 'fontUp' };
  if (/(smaller|decrease|reduce|chota)/.test(text)) return { type: 'fontDown' };
  return null;
};
