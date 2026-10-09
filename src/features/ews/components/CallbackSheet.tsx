import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import { HyperlinkButton, PrimaryButton } from '@/components/buttons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/store/auth.store';
import { useUserStore } from '@/store/user.store';
import { CALLBACK_HOURS } from '../lib/questionnaire';
import { recordConsent, requestCallback, type CallbackCategory } from '../lib/ewsService';
import { useEwsUserId } from '../hooks/useEws';
import { ConsentTick } from './ConsentTick';
import { EwsSheet } from './EwsSheet';
import { PhoneField } from './PhoneField';
import { ewsText } from './text';

// Helpline callback — Figma "Book/Enquire" pop-up (3344:332422) with the
// booking removed: Serve Saathi is discovery-only, so "Call Me Back" becomes
// "Request a callback" and "Agents are currently online" (a promise we can't
// keep) becomes the spec's fixed business-hours copy.
//
// One decision only: the person signed in with their phone, so we show that
// number and ask them to confirm — "Change" opens a field for a different
// number, "Use +91 … instead" goes back. No name field: the account name goes
// with the request. Accounts without a phone get an empty number field.
// Consent stays a separate tick: a callback is a new purpose for that number.

const DATA_ITEMS = ['Mobile number', 'Your name (from your account)'];

/** "9876543210" → "+91 98765 43210". */
export const formatPhone = (digits: string) => `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
const toDigits = (phone: string | null | undefined) => (phone ?? '').replace(/\D/g, '').slice(-10);

type CallbackSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Called once the request is saved. */
  onRequested?: () => void;
  category: CallbackCategory;
  safetyEventKey?: string;
  dim?: string;
  /** S6: call back only on a number the person confirms is safe. */
  isPrivate?: boolean;
};

export const CallbackSheet: React.FC<CallbackSheetProps> = ({
  visible,
  onClose,
  onRequested,
  category,
  safetyEventKey,
  dim,
  isPrivate = false,
}) => {
  const colors = useThemeColors();
  const userId = useEwsUserId();
  const authPhone = useAuthStore((s) => s.phone);
  const profile = useUserStore((s) => s.profile);
  const accountPhone = toDigits(authPhone ?? profile?.phone);
  const hasAccountPhone = accountPhone.length === 10;

  const [editing, setEditing] = useState(!hasAccountPhone);
  const [phone, setPhone] = useState(hasAccountPhone ? accountPhone : '');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; consent?: string }>({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fresh form every time it opens.
  useEffect(() => {
    if (!visible) return;
    setDone(false);
    setEditing(!hasAccountPhone);
    setPhone(hasAccountPhone ? accountPhone : '');
    setConsent(false);
    setErrors({});
  }, [visible, hasAccountPhone, accountPhone]);

  const submit = async () => {
    const errs: typeof errors = {};
    if (!/^[6-9]\d{9}$/.test(phone)) errs.phone = 'Enter a 10-digit mobile number.';
    if (!consent) errs.consent = 'Please agree before we call you.';
    setErrors(errs);
    if (errs.phone) setEditing(true);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    await recordConsent('callback-request', DATA_ITEMS);
    await requestCallback({
      userId,
      category,
      safetyEventKey,
      dim,
      name: profile?.name?.trim() ?? '',
      phone,
      private: isPrivate,
    });
    setSubmitting(false);
    setDone(true);
    onRequested?.();
  };

  return (
    <EwsSheet visible={visible} title={done ? 'Request received' : 'Request a callback'} onClose={onClose}>
      {done ? (
        <>
          <Text style={[ewsText.body, styles.center, { color: colors.text.secondary }]}>
            Thank you. We’ll call you on{' '}
            <Text style={{ color: colors.text.primary, fontFamily: theme.fonts.semiBold }}>{formatPhone(phone)}</Text>.{' '}
            {CALLBACK_HOURS} We’ll call within 2 working days.
          </Text>
          <PrimaryButton label="Done" onPress={onClose} />
        </>
      ) : (
        <>
          {isPrivate && (
            <Text style={[ewsText.body, { color: colors.text.secondary }]}>
              Only use a number that is safe for us to call. We won’t tell anyone else you asked.
            </Text>
          )}

          {editing ? (
            <PhoneField
              label={hasAccountPhone ? 'Call me on a different number' : 'Mobile number to call'}
              value={phone}
              onChange={(v) => {
                setPhone(v);
                if (errors.phone) setErrors((x) => ({ ...x, phone: undefined }));
              }}
              error={errors.phone}
              autoFocus={hasAccountPhone}
            />
          ) : (
            <View style={[styles.confirm, { backgroundColor: colors.background.base, borderColor: colors.border.card }]}>
              <View style={styles.confirmText}>
                <Text style={[ewsText.body, { color: colors.text.tertiary }]}>We’ll call you on</Text>
                <Text style={[ewsText.h3, { color: colors.text.primary }]}>{formatPhone(phone)}</Text>
              </View>
              <Pressable onPress={() => setEditing(true)} accessibilityRole="button" accessibilityLabel="Change the number to call" hitSlop={8}>
                <Text style={[ewsText.h5, styles.link, { color: colors.accentPrimary }]}>Change</Text>
              </Pressable>
            </View>
          )}
          {editing && hasAccountPhone && (
            <HyperlinkButton
              label={`Use ${formatPhone(accountPhone)} instead`}
              textColor={colors.accentPrimary}
              style={styles.start}
              onPress={() => {
                setPhone(accountPhone);
                setEditing(false);
                setErrors((x) => ({ ...x, phone: undefined }));
              }}
            />
          )}

          <ConsentTick
            dataItems={DATA_ITEMS}
            purpose="call you back about the support you asked for."
            checked={consent}
            onChange={(v) => {
              setConsent(v);
              if (v) setErrors((x) => ({ ...x, consent: undefined }));
            }}
            error={errors.consent}
          />
          <PrimaryButton label="Request a callback" onPress={submit} loading={submitting} />
          <Text style={[ewsText.small, styles.center, styles.italic, { color: colors.text.tertiary }]}>{CALLBACK_HOURS}</Text>
        </>
      )}
    </EwsSheet>
  );
};

const styles = StyleSheet.create({
  center: {
    textAlign: 'center',
  },
  italic: {
    fontStyle: 'italic',
  },
  confirm: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
    borderWidth: 1.5,
    borderRadius: theme.radius.input,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  confirmText: {
    flex: 1,
  },
  link: {
    textDecorationLine: 'underline',
  },
  start: {
    alignSelf: 'flex-start',
  },
});

export default CallbackSheet;
