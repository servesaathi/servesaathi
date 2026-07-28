import { describe, test, expect } from '@jest/globals';
import { parseVoiceCommand } from '../voiceCommandParser';

describe('parseVoiceCommand', () => {
  test('font size up', () => {
    expect(parseVoiceCommand('Make the text bigger please')).toEqual({ type: 'fontUp' });
    expect(parseVoiceCommand('increase font size')).toEqual({ type: 'fontUp' });
    expect(parseVoiceCommand('larger text')).toEqual({ type: 'fontUp' });
  });

  test('font size down', () => {
    expect(parseVoiceCommand('smaller text')).toEqual({ type: 'fontDown' });
    expect(parseVoiceCommand('reduce the font')).toEqual({ type: 'fontDown' });
  });

  test('contrast commands', () => {
    expect(parseVoiceCommand('high contrast')).toEqual({ type: 'contrast', high: true });
    expect(parseVoiceCommand('turn on dark mode')).toEqual({ type: 'contrast', high: true });
    expect(parseVoiceCommand('normal contrast')).toEqual({ type: 'contrast', high: false });
    expect(parseVoiceCommand('less contrast please')).toEqual({ type: 'contrast', high: false });
  });

  test('contrast wins over font keywords in the same phrase', () => {
    expect(parseVoiceCommand('increase contrast')).toEqual({ type: 'contrast', high: true });
    expect(parseVoiceCommand('decrease contrast')).toEqual({ type: 'contrast', high: false });
  });

  test('continue and help', () => {
    expect(parseVoiceCommand('continue')).toEqual({ type: 'continue' });
    expect(parseVoiceCommand('go to the next step')).toEqual({ type: 'continue' });
    expect(parseVoiceCommand('help')).toEqual({ type: 'help' });
    expect(parseVoiceCommand('what can I say')).toEqual({ type: 'help' });
  });

  test('unknown phrases return null', () => {
    expect(parseVoiceCommand('play some music')).toBeNull();
    expect(parseVoiceCommand('')).toBeNull();
  });
});
