import React, { useEffect } from 'react';
import { BackHandler, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import { IconButton } from '@/components/buttons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { ewsText } from './text';

// The EWS pop-up shell — Figma "Quick Welbeing Score" / "Book/Enquire" /
// "OPT Verfiy Code" (3344:324186, 3344:332422, 3344:332446): Bg-Background
// card, 16px radius, 24px padding, "Pop up Headline Bar" (22/30 title + 40px
// green close button) over the same dimmed backdrop as LeadCaptureModal.
//
// `blocking` is for cards that must be acknowledged (Tier 1 safety, the score
// pop-up): no close button, the backdrop does nothing, and the Android back
// button is swallowed both by the Modal (onRequestClose) and by BackHandler
// for the screen underneath.

type EwsSheetProps = {
  visible: boolean;
  title?: string;
  /** Close button + backdrop/back-button dismiss. Omit together with `blocking`. */
  onClose?: () => void;
  blocking?: boolean;
  children: React.ReactNode;
  accessibilityLabel?: string;
};

export const EwsSheet: React.FC<EwsSheetProps> = ({ visible, title, onClose, blocking = false, children, accessibilityLabel }) => {
  const colors = useThemeColors();

  useEffect(() => {
    if (!visible || !blocking) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [visible, blocking]);

  const requestClose = () => {
    if (!blocking) onClose?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={requestClose}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          style={[styles.card, { backgroundColor: colors.background.layout }]}
          accessibilityViewIsModal
          accessibilityLabel={accessibilityLabel}
        >
          {(title || (onClose && !blocking)) && (
            <View style={styles.headline}>
              {onClose && !blocking && <View style={styles.side} />}
              <Text accessibilityRole="header" style={[ewsText.h2, styles.title, { color: colors.text.primary }]}>
                {title}
              </Text>
              {onClose && !blocking && (
                <IconButton type="close" bg={colors.accentPrimary} accessibilityLabel="Close" onPress={onClose} size={40} />
              )}
            </View>
          )}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(9, 25, 10, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.hud,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '100%',
    borderRadius: 16,
    paddingTop: theme.spacing.xxl,
    ...theme.shadows.md,
  },
  headline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.lg,
  },
  side: {
    width: 40,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  scroll: {
    flexGrow: 0,
  },
  content: {
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
});

export default EwsSheet;
