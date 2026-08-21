import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { Screen, Header } from '@/components/layouts';
import { theme } from '@/theme';
import { Icon } from '@/components/icons';
import { responsiveFontSize } from '@/utils/responsive';
import { useUserStore } from '@/store/user.store';
import { isSpeechRecognitionAvailable, startListening } from '@/services/voice';
import { useThemeColors } from '@/hooks/useThemeColors';
import {
  ChatMessage,
  SUPPORT_CHAT_SUGGESTIONS,
  CHAT_REPLIES,
  DEFAULT_CHAT_REPLY,
  IMAGE_CHAT_REPLY,
} from '../data';

// Simple hand-drawn mic glyph — not in the app's generated icon set (Figma node 2017:6500).
const MicIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 15.5a3.5 3.5 0 0 0 3.5-3.5V6a3.5 3.5 0 0 0-7 0v6a3.5 3.5 0 0 0 3.5 3.5Z"
      stroke={color}
      strokeWidth="1.8"
    />
    <Path
      d="M6.5 11.5V12a5.5 5.5 0 0 0 11 0v-.5M12 17.5V21m-3 0h6"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </Svg>
);

// Attachment/clip glyph (Figma "Clip" icon, node 1376:19273) — not in the app's generated
// icon set, so hand-drawn like MicIcon above.
const AttachmentIcon: React.FC<{ size?: number; color?: string }> = ({ size = 22, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18.5 10.5 12 17a3.5 3.5 0 0 1-5-5l7-7a2.5 2.5 0 0 1 3.5 3.5l-7 7a1.5 1.5 0 0 1-2-2l6-6"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

let idCounter = 0;
const nextId = () => `msg_${Date.now()}_${idCounter++}`;

// "Support Chat" (Figma 1376:19257 empty state / 1376:19328 conversation) — a single screen
// that toggles between the two states; replies are canned mock text until the chat API exists.
export const SupportChatScreen: React.FC = () => {
  const colors = useThemeColors();
  const userName = useUserStore((s) => s.profile?.name) ?? 'Kamala';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const stopListeningRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => stopListeningRef.current?.();
  }, []);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = { id: nextId(), from: 'me', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setDraft('');

    const reply = CHAT_REPLIES[trimmed] ?? DEFAULT_CHAT_REPLY;
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: nextId(), from: 'bot', text: reply }]);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }, 500);
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  const sendImageMessage = (uri: string) => {
    setMessages((prev) => [...prev, { id: nextId(), from: 'me', imageUri: uri }]);
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: nextId(), from: 'bot', text: IMAGE_CHAT_REPLY }]);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }, 500);
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  const handleAttachPress = async () => {
    try {
      // System photo picker needs no extra permission on iOS (PHPicker) or Android 13+.
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        sendImageMessage(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Something went wrong', 'Could not open your photo gallery. Please try again.');
    }
  };

  const handleCameraPress = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera access needed',
        'Allow ServeSaathi to use your camera in Settings to attach a photo.'
      );
      return;
    }
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        sendImageMessage(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Something went wrong', 'Could not open the camera. Please try again.');
    }
  };

  const stopListening = () => {
    stopListeningRef.current?.();
    stopListeningRef.current = null;
    setListening(false);
  };

  const handleComposerButtonPress = async () => {
    if (listening) {
      stopListening();
      return;
    }
    if (draft.trim()) {
      sendMessage(draft);
      return;
    }
    if (!isSpeechRecognitionAvailable()) {
      Alert.alert(
        'Voice input unavailable',
        "Speech-to-text needs the ServeSaathi app build — it isn't available in this preview (Expo Go / web)."
      );
      return;
    }
    setListening(true);
    const cleanup = await startListening({
      onResult: (transcript) => {
        stopListening();
        sendMessage(transcript);
      },
      onEnd: () => stopListening(),
      onError: (message) => {
        Alert.alert('Voice input', message);
        stopListening();
      },
    });
    if (!cleanup) {
      setListening(false);
      return;
    }
    stopListeningRef.current = cleanup;
  };

  const hasConversation = messages.length > 0;

  return (
    <Screen statusBarBg={colors.background.layout}>
      <Header title="Support Chat" leftIcon="back" transparent />

      {hasConversation ? (
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((m) => (
            <View
              key={m.id}
              style={[styles.bubbleRow, m.from === 'me' && styles.bubbleRowMe]}
            >
              <View
                style={[
                  styles.bubble,
                  m.from === 'me'
                    ? { backgroundColor: colors.accentPrimary, borderTopRightRadius: 4 }
                    : { backgroundColor: colors.background.base, borderTopLeftRadius: 4 },
                ]}
              >
                {m.imageUri ? (
                  <Image source={{ uri: m.imageUri }} style={styles.bubbleImage} />
                ) : (
                  <Text style={[styles.bubbleText, { color: m.from === 'me' ? colors.textInverse : colors.text.strong }]}>
                    {m.text}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={[styles.greeting, { color: colors.text.secondary }]}>
            Hello <Text style={[styles.greetingName, { color: colors.accentOrange }]}>{userName}</Text>
          </Text>
          <Text style={[styles.subGreeting, { color: colors.text.secondary }]}>How can I help you today?</Text>

          <View style={styles.suggestionList}>
            {SUPPORT_CHAT_SUGGESTIONS.map((question) => (
              <Pressable
                key={question}
                style={[styles.suggestionChip, { backgroundColor: colors.background.base }]}
                onPress={() => sendMessage(question)}
              >
                <Text style={[styles.suggestionText, { color: colors.text.muted }]} numberOfLines={2}>
                  {question}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <View style={styles.composerRow}>
        <View style={[styles.messageField, { backgroundColor: colors.background.base }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message"
            placeholderTextColor={colors.text.muted}
            style={[styles.messageInput, { color: colors.text.primary }]}
            onSubmitEditing={() => sendMessage(draft)}
            returnKeyType="send"
          />
          <View style={styles.composerIconGroup}>
            <Pressable
              onPress={handleAttachPress}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Attach a photo from gallery"
            >
              <AttachmentIcon size={22} color={colors.text.muted} />
            </Pressable>
            <Pressable
              onPress={handleCameraPress}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Take a photo"
            >
              <Icon name="camera" variant="outline" size={22} color={colors.text.muted} />
            </Pressable>
          </View>
        </View>
        <Pressable
          style={[styles.micButton, { backgroundColor: colors.accentPrimary }, listening && styles.micButtonListening]}
          onPress={handleComposerButtonPress}
          accessibilityRole="button"
          accessibilityLabel={listening ? 'Stop voice input' : draft.trim() ? 'Send message' : 'Start voice input'}
        >
          {draft.trim() && !listening ? (
            <Icon name="send" variant="filled" size={20} color="#FFFFFF" />
          ) : (
            <MicIcon size={22} color="#FFFFFF" />
          )}
        </Pressable>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  emptyState: {
    flex: 1,
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.xl,
  },
  greeting: {
    fontFamily: theme.typography.h1.fontFamily,
    fontSize: responsiveFontSize(26),
    color: theme.colors.neutral[700],
  },
  greetingName: {
    color: theme.colors.tertiary,
  },
  subGreeting: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
    color: theme.colors.neutral[700],
    marginBottom: theme.spacing.xl,
  },
  suggestionList: {
    gap: theme.spacing.md,
  },
  suggestionChip: {
    backgroundColor: theme.colors.background.base,
    borderRadius: theme.radius.control,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.md,
    ...theme.shadows.sm,
  },
  suggestionText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[500],
  },
  messageList: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  bubbleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  bubbleRowMe: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  bubbleBot: {
    backgroundColor: theme.colors.background.base,
    borderTopLeftRadius: 4,
  },
  bubbleMe: {
    backgroundColor: theme.colors.secondary,
    borderTopRightRadius: 4,
  },
  bubbleImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  bubbleText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[700],
  },
  bubbleTextMe: {
    color: '#FFFFFF',
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  messageField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.background.base,
    paddingHorizontal: theme.spacing.lg,
  },
  composerIconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  messageInput: {
    flex: 1,
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[900],
    ...Platform.select({ web: { outlineStyle: 'none' as any } }),
  },
  micButton: {
    width: 49,
    height: 49,
    borderRadius: 200,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonListening: {
    backgroundColor: theme.colors.status.error,
  },
});
