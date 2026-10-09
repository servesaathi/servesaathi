import React, { useEffect, useState } from 'react';
import { BackHandler, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { HyperlinkButton, LightButton, PrimaryButton, SecondaryButton } from '@/components/buttons';
import { Checkbox } from '@/components/inputs';
import { useThemeColors } from '@/hooks/useThemeColors';
import { CALLBACK_HOURS, NOT_EMERGENCY, SAFETY, type Mode } from '../lib/questionnaire';
import type { SafetyEvent, SafetyUserAction } from '../lib/ewsService';
import { CallbackSheet } from './CallbackSheet';
import { EwsSheet } from './EwsSheet';
import { ewsText } from './text';
import PhoneIcon from '../../../../assets/ews/phone.svg';
import CloseIcon from '../../../../assets/ews/close.svg';

// Safety & escalation card (spec E; website SafetyDialog). No Figma frame
// exists for it. Copy comes verbatim from SAFETY — never generated.
//   Tier 1: interrupts the check-in immediately as a full-screen modal that
//           can't be dismissed without acknowledging (no close button, the
//           Android back button is swallowed, a full-screen iOS modal has no
//           swipe-to-dismiss), tap-to-call buttons, "not an emergency service".
//   Tier 2: shown at the end of the area; business-hours callback and (unless
//           S1/S6) an opt-in "share this with family".
//   Tier 3: gentle support numbers.
// Only the trigger id, tier, time, mode and the button pressed are stored.

const NO_TRUSTED_CONTACT =
  'You haven’t added a trusted contact yet, so we couldn’t let anyone know. Please call them directly, or use one of the numbers above.';

type SafetyModalProps = {
  event: SafetyEvent | null;
  mode: Mode;
  /** "results": re-opened from the overview, so no stop/continue flow. */
  context: 'check-in' | 'results';
  onAction: (action: SafetyUserAction) => void;
  onToggleShare?: (share: boolean) => void;
  onContinue: () => void;
  onStopForNow?: () => void;
  onQuickExit?: () => void;
};

export const SafetyModal: React.FC<SafetyModalProps> = ({
  event,
  mode,
  context,
  onAction,
  onToggleShare,
  onContinue,
  onStopForNow,
  onQuickExit,
}) => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const card = event ? SAFETY[event.id] : null;
  const tier1 = card?.tier === 1;

  useEffect(() => setNotice(null), [event?.key]);

  // The full-screen modal's onRequestClose already ignores back; this also
  // covers the instant between cards and the screen underneath.
  useEffect(() => {
    if (!event || !tier1) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [event, tier1]);

  const done = () => {
    setNotice(null);
    onContinue();
  };

  const chip = !card
    ? null
    : card.tier === 1
      ? { label: '◆ Please read', bg: colors.errorSurface, fg: colors.error }
      : card.tier === 2
        ? { label: '▲ Worth following up', bg: colors.accentOrangeSurface, fg: colors.accentOrangeText }
        : { label: 'Support numbers', bg: colors.border.hairline, fg: colors.accentPrimary };

  const body = event && card && chip && (
    <View style={styles.body} accessibilityLiveRegion="assertive">
      <View style={styles.topRow}>
        <View style={[styles.chip, { backgroundColor: chip.bg }]}>
          <Text style={[ewsText.h5, { color: chip.fg }]}>{chip.label}</Text>
        </View>
        {card.quickExit && onQuickExit && (
          <LightButton
            label="Quick exit"
            size="small"
            prefixIcon={<CloseIcon width={16} height={16} color={colors.accentPrimaryStrong} />}
            onPress={() => {
              onAction('exited');
              onQuickExit();
            }}
          />
        )}
      </View>

      <Text accessibilityRole="alert" style={[styles.msg, { color: colors.text.primary }]}>
        {card.msg}
      </Text>

      <View style={styles.buttons}>
        {(card.buttons ?? [])
          // Family member answering: they're already the support person.
          .filter((b) => !(b.kind === 'notify' && mode === 'proxy'))
          .filter((b) => !(b.kind === 'continue_later' && context === 'results'))
          .map((b) => {
            if (b.kind === 'call') {
              return (
                <SecondaryButton
                  key={b.label}
                  label={b.label}
                  accessibilityLabel={`${b.label}. Opens the phone dialler.`}
                  prefixIcon={<PhoneIcon width={20} height={20} color={colors.textInverse} />}
                  onPress={() => {
                    onAction('called_number');
                    Linking.openURL(`tel:${b.number}`).catch(() => undefined);
                  }}
                />
              );
            }
            if (b.kind === 'notify') {
              return (
                <LightButton
                  key={b.label}
                  label={b.label}
                  onPress={() => {
                    onAction('notified_contact');
                    // TODO(backend): trusted contacts (spec G, P4) don't exist
                    // yet — say so honestly instead of pretending a message
                    // went out.
                    setNotice(NO_TRUSTED_CONTACT);
                  }}
                />
              );
            }
            if (b.kind === 'callback') {
              return <LightButton key={b.label} label={b.label} onPress={() => setCallbackOpen(true)} />;
            }
            return <LightButton key={b.label} label={b.label} onPress={() => onStopForNow?.()} />;
          })}

        {card.tier === 2 && (
          <>
            <LightButton label="Request a callback" onPress={() => setCallbackOpen(true)} />
            <Text style={[ewsText.small, { color: colors.text.tertiary }]}>{CALLBACK_HOURS} (within 2 working days)</Text>
            {!card.hideFamily && onToggleShare && (
              <Pressable
                style={styles.share}
                onPress={() => onToggleShare(!event.share)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: event.share }}
              >
                <View pointerEvents="none">
                  <Checkbox checked={event.share} />
                </View>
                <Text style={[ewsText.body, { color: colors.text.secondary }]}>Share this with family</Text>
              </Pressable>
            )}
          </>
        )}
      </View>

      {notice && (
        <View style={[styles.notice, { backgroundColor: colors.background.orange }]} accessibilityLiveRegion="polite">
          <Text style={[ewsText.body, { color: colors.text.secondary }]}>{notice}</Text>
        </View>
      )}

      {card.tier === 1 && <Text style={[ewsText.h5, { color: colors.text.tertiary }]}>{NOT_EMERGENCY}</Text>}

      <View style={[styles.footer, { borderTopColor: colors.border.hairline }]}>
        <PrimaryButton label={context === 'results' ? 'Back to results' : 'I understand – Continue'} onPress={done} />
        {card.tier === 1 && context === 'check-in' && onStopForNow && !card.buttons?.some((b) => b.kind === 'continue_later') && (
          <HyperlinkButton label="Stop for now" textColor={colors.accentPrimary} onPress={onStopForNow} />
        )}
      </View>
    </View>
  );

  return (
    <>
      {tier1 ? (
        <Modal
          visible={Boolean(event) && !callbackOpen}
          animationType="slide"
          presentationStyle="fullScreen"
          statusBarTranslucent
          onRequestClose={() => undefined}
        >
          <View style={[styles.full, { backgroundColor: colors.background.layout }]} accessibilityViewIsModal accessibilityLabel="Please read: support information">
            <ScrollView
              contentContainerStyle={[styles.fullContent, { paddingTop: insets.top + theme.spacing.xxl, paddingBottom: insets.bottom + theme.spacing.xxl }]}
            >
              {body}
            </ScrollView>
          </View>
        </Modal>
      ) : (
        <EwsSheet visible={Boolean(event) && !callbackOpen} onClose={done} accessibilityLabel="Support information">
          {body}
        </EwsSheet>
      )}

      {event && card && (
        <CallbackSheet
          visible={callbackOpen}
          onClose={() => setCallbackOpen(false)}
          onRequested={() => onAction('callback_requested')}
          category={card.tier === 1 ? 'safety_tier1' : 'safety_tier2'}
          safetyEventKey={event.key}
          isPrivate={card.buttons?.some((b) => b.kind === 'callback' && b.private)}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  full: {
    flex: 1,
  },
  fullContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xxl,
  },
  body: {
    gap: theme.spacing.xl,
  },
  topRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  chip: {
    borderRadius: 60,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
  },
  msg: {
    fontFamily: theme.fonts.regular,
    fontSize: responsiveFontSize(20),
    lineHeight: 30,
  },
  buttons: {
    gap: theme.spacing.md,
  },
  share: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  notice: {
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  footer: {
    gap: theme.spacing.md,
    borderTopWidth: 1.5,
    paddingTop: theme.spacing.xl,
  },
});

export default SafetyModal;
