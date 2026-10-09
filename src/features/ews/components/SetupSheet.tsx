import React, { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import { HyperlinkButton, LightButton, PrimaryButton, SecondaryButton } from '@/components/buttons';
import { OTPInput, SelectableChip, TextInput } from '@/components/inputs';
import { useThemeColors } from '@/hooks/useThemeColors';
import type { Mode } from '../lib/questionnaire';
import { recordConsent, type ProxyDetails, type StartInput } from '../lib/ewsService';
import { ChoiceCard } from './ChoiceCard';
import { ConsentTick } from './ConsentTick';
import { EwsSheet } from './EwsSheet';
import { NavButtons } from './NavButtons';
import { PhoneField } from './PhoneField';
import { StepBar } from './StepBar';
import { ewsText } from './text';
import PhoneIcon from '../../../../assets/ews/phone.svg';
import ChevronDown from '../../../../assets/ews/chevron-down.svg';

// Before the first question — Figma's "Quick welling check" pop-up frames
// (3344:323039 …) and "Book/Enquire" + "OPT Verfiy Code" (3344:332422,
// 3344:332446 / 332472) carry the spec's set-up steps instead of their own
// placeholder questions (decided with the user):
//   1. Layer-1 consent notice (spec G, P1), verbatim — "I agree" records it.
//   2. Who is answering? Self / Assisted / Proxy (spec A).
//   3a. Self: "Are you answering on your own right now?" (private items gate).
//   3b. Proxy: the elder's name, relationship and mobile …
//   4.  … then the elder's OTP, or the elder confirming on screen. A family
//       member can't start until the elder agrees (spec G "special situations").
// TODO(backend): there's no OTP endpoint for elder consent yet, so the code is
// checked against DEMO_OTP locally and shown on screen.

const DEMO_OTP = '4321';
const RESEND_SECONDS = 30;
const PRIVACY_URL = 'https://servesaathi.com/privacy';

const RELATIONSHIPS = ['Daughter', 'Son', 'Spouse', 'Daughter-in-law', 'Son-in-law', 'Grandchild', 'Sibling', 'Other family', 'Paid caregiver'];

const CONSENT_ITEMS = ['Your answers to about 26 short questions', 'Who answered (you, with help, or a family member)'];
const PROXY_ITEMS = ['Their name', 'Their mobile number', 'Your relationship to them'];

type Step = 'consent' | 'notnow' | 'mode' | 'private' | 'proxy' | 'otp' | 'declined';

const TITLES: Record<Step, string> = {
  consent: 'Before you begin',
  notnow: 'No problem',
  mode: 'Who is answering?',
  private: 'One quick check',
  proxy: 'Who are you answering for?',
  otp: 'Enter verification code',
  declined: 'Check-in not started',
};

type SetupSheetProps = {
  visible: boolean;
  onClose: () => void;
  onStart: (input: StartInput) => void;
};

export const SetupSheet: React.FC<SetupSheetProps> = ({ visible, onClose, onStart }) => {
  const colors = useThemeColors();
  const [step, setStep] = useState<Step>('consent');
  const [mode, setMode] = useState<Mode | null>(null);
  const [alone, setAlone] = useState<'yes' | 'no' | null>(null);
  const [declineMsg, setDeclineMsg] = useState('');

  useEffect(() => {
    if (!visible) return;
    setStep('consent');
    setMode(null);
    setAlone(null);
  }, [visible]);

  const total = mode === 'proxy' ? 4 : 3;
  const position: Partial<Record<Step, number>> = { consent: 1, mode: 2, private: 3, proxy: 3, otp: 4 };

  return (
    <EwsSheet visible={visible} title={TITLES[step]} onClose={onClose}>
      {position[step] && <StepBar current={position[step]!} total={step === 'consent' ? 3 : total} />}

      {step === 'consent' && (
        <ConsentStep
          onAgree={() => {
            recordConsent('ews-check-in', CONSENT_ITEMS);
            setStep('mode');
          }}
          onNotNow={() => setStep('notnow')}
        />
      )}

      {step === 'notnow' && (
        <>
          <Text style={[ewsText.body, styles.center, { color: colors.text.secondary }]}>
            That’s fine. You can still use Serve Saathi’s helpline, guides and directory. You can take the check-in any time from
            Home.
          </Text>
          <PrimaryButton label="Back to Home" onPress={onClose} />
        </>
      )}

      {step === 'mode' && (
        <>
          <Text style={[ewsText.h4, { color: colors.text.primary }]}>Who is answering today?</Text>
          <View style={styles.options} accessibilityRole="radiogroup">
            {(
              [
                ['self', 'I am answering myself'],
                ['assisted', 'I’m answering, someone is helping me read or tap'],
                ['proxy', 'I’m a family member answering for someone'],
              ] as [Mode, string][]
            ).map(([value, label]) => (
              <ChoiceCard key={value} label={label} selected={mode === value} onPress={() => setMode(value)} />
            ))}
          </View>
          <NavButtons
            onBack={() => setStep('consent')}
            nextDisabled={!mode}
            onNext={() => {
              if (mode === 'self') setStep('private');
              else if (mode === 'proxy') setStep('proxy');
              // Assisted: private items are skipped (the helper may be the
              // source of harm); the elder is offered them privately later.
              else onStart({ mode: 'assisted', privateConfirmed: false });
            }}
          />
        </>
      )}

      {step === 'private' && (
        <>
          <Text style={[ewsText.h4, { color: colors.text.primary }]}>
            A few questions later are personal. Are you answering on your own right now?
          </Text>
          <View style={styles.options} accessibilityRole="radiogroup">
            <ChoiceCard label="Yes, I am on my own" selected={alone === 'yes'} onPress={() => setAlone('yes')} />
            <ChoiceCard label="No, someone is with me" selected={alone === 'no'} onPress={() => setAlone('no')} />
          </View>
          <NavButtons
            onBack={() => setStep('mode')}
            nextDisabled={!alone}
            nextLabel="Start check-in"
            onNext={() => onStart({ mode: 'self', privateConfirmed: alone === 'yes' })}
          />
        </>
      )}

      {(step === 'proxy' || step === 'otp') && (
        <ProxySteps
          step={step}
          onBack={() => setStep(step === 'otp' ? 'proxy' : 'mode')}
          onSent={() => setStep('otp')}
          onAgreed={(proxy) => onStart({ mode: 'proxy', privateConfirmed: false, proxy })}
          onDeclined={(msg) => {
            setDeclineMsg(msg);
            setStep('declined');
          }}
        />
      )}

      {step === 'declined' && (
        <>
          <Text style={[ewsText.body, styles.center, { color: colors.text.secondary }]}>{declineMsg}</Text>
          <SecondaryButton
            label="Call Elderline 14567"
            prefixIcon={<PhoneIcon width={20} height={20} color={colors.textInverse} />}
            onPress={() => Linking.openURL('tel:14567').catch(() => undefined)}
          />
          <PrimaryButton label="Back to Home" onPress={onClose} />
        </>
      )}
    </EwsSheet>
  );
};

function ConsentStep({ onAgree, onNotNow }: { onAgree: () => void; onNotNow: () => void }) {
  const colors = useThemeColors();
  const [more, setMore] = useState(false);
  const strong = { color: colors.text.primary, fontFamily: theme.fonts.semiBold };
  const p = [ewsText.body, { color: colors.text.secondary }];
  return (
    <>
      {/* Spec G, Layer 1 — verbatim. */}
      <Text style={p}>
        The Elder Well-being Score asks about <Text style={strong}>26 short questions</Text> about daily life, health habits,
        feelings, home, and money matters. It takes about <Text style={strong}>10 minutes</Text>.
      </Text>
      <Text style={p}>
        <Text style={strong}>Why:</Text> to show which areas are going well and where support might help, and to suggest next
        steps. <Text style={strong}>It is not a medical test or diagnosis.</Text>
      </Text>
      <Text style={p}>
        <Text style={strong}>Who sees it:</Text> only you. Family members see it only if you choose to share. Our support team sees
        only what they need to help you if you ask.
      </Text>
      <Text style={p}>
        <Text style={strong}>It’s your choice:</Text> you can skip questions, stop anytime, and delete your answers later. Not
        taking it won’t affect anything else in Serve Saathi.
      </Text>
      {/* Layer 2 — "Read more". */}
      <View style={[styles.more, { backgroundColor: colors.background.base }]}>
        <Pressable onPress={() => setMore((m) => !m)} accessibilityRole="button" accessibilityState={{ expanded: more }} style={styles.moreHead}>
          <Text style={[ewsText.h5, { color: colors.accentPrimary }]}>Read more</Text>
          <View style={more && styles.flip}>
            <ChevronDown width={20} height={20} color={colors.accentPrimary} />
          </View>
        </Pressable>
        {more && (
          <View style={styles.bullets}>
            {[
              'Answers are kept for 24 months (or 30 days if you turn off history).',
              'You can withdraw any time from Settings — family access stops immediately.',
              'You can contact our Grievance Officer from Help.',
              'You can nominate someone to act for you.',
            ].map((t) => (
              <Text key={t} style={[ewsText.body, { color: colors.text.secondary }]}>
                • {t}
              </Text>
            ))}
            <Text style={[ewsText.body, { color: colors.text.secondary }]}>
              • Full{' '}
              <Text style={[strong, { color: colors.accentPrimary }]} onPress={() => Linking.openURL(PRIVACY_URL).catch(() => undefined)}>
                Privacy Notice
              </Text>
              .
            </Text>
          </View>
        )}
      </View>
      <PrimaryButton label="I agree, let’s begin" onPress={onAgree} />
      <SecondaryButton label="Not now" onPress={onNotNow} />
    </>
  );
}

function ProxySteps({
  step,
  onBack,
  onSent,
  onAgreed,
  onDeclined,
}: {
  step: 'proxy' | 'otp';
  onBack: () => void;
  onSent: () => void;
  onAgreed: (proxy: ProxyDetails) => void;
  onDeclined: (msg: string) => void;
}) {
  const colors = useThemeColors();
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<'name' | 'relationship' | 'phone' | 'consent' | 'otp', string>>>({});
  const [otp, setOtp] = useState('');
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (step !== 'otp' || seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, seconds]);

  const elder = name.trim() || 'them';

  if (step === 'proxy') {
    const send = () => {
      const errs: typeof errors = {};
      if (!name.trim()) errs.name = 'Enter their name.';
      if (!relationship) errs.relationship = 'Choose how you’re related.';
      if (!/^[6-9]\d{9}$/.test(phone)) errs.phone = 'Enter their 10-digit mobile number.';
      if (!consent) errs.consent = 'Please agree before we send the code.';
      setErrors(errs);
      if (Object.keys(errs).length) return;
      recordConsent('ews-check-in', PROXY_ITEMS);
      setOtp('');
      setSeconds(RESEND_SECONDS);
      onSent();
    };
    return (
      <>
        <Text style={[ewsText.body, { color: colors.text.secondary }]}>
          We need their permission first. We’ll send a code to their phone — ask them to share it with you.
        </Text>
        <TextInput label="Their name" placeholder="Full Name" value={name} onChangeText={setName} error={errors.name} autoCapitalize="words" />
        <View style={styles.field}>
          <Text style={[ewsText.h5, { color: colors.text.primary }]}>You are their…</Text>
          <View style={styles.chips}>
            {RELATIONSHIPS.map((r) => (
              <SelectableChip key={r} label={r} selected={relationship === r.toLowerCase()} onPress={() => setRelationship(r.toLowerCase())} />
            ))}
          </View>
          {errors.relationship && <Text style={[ewsText.small, { color: colors.error }]}>{errors.relationship}</Text>}
        </View>
        <PhoneField label="Their mobile number" value={phone} onChange={setPhone} error={errors.phone} />
        <ConsentTick
          dataItems={PROXY_ITEMS}
          purpose="ask them for permission by text message, and label the results as answered by you."
          checked={consent}
          onChange={setConsent}
          error={errors.consent}
        />
        <NavButtons onBack={onBack} onNext={send} nextLabel="Send code" />
      </>
    );
  }

  const masked = `+91-${phone.slice(0, 2)}****${phone.slice(-2)}`;
  const proxy = (consentMethod: ProxyDetails['consentMethod']): ProxyDetails => ({ elderName: name.trim(), relationship, consentMethod });
  const verify = (code: string = otp) => {
    if (code !== DEMO_OTP) {
      setErrors({ otp: `That code doesn’t match. Please check with ${elder}.` });
      return;
    }
    onAgreed(proxy('otp_elder'));
  };

  return (
    <>
      <Text style={[ewsText.body, styles.center, { color: colors.text.secondary }]}>
        The code has been sent to {elder}’s mobile{'\n'}
        <Text style={{ color: colors.text.strong, fontFamily: theme.fonts.bold }}>{masked}</Text>
      </Text>
      <OTPInput
        length={4}
        value={otp}
        onChange={(v) => {
          setOtp(v);
          if (errors.otp) setErrors({});
        }}
        onComplete={verify}
        error={Boolean(errors.otp)}
      />
      {errors.otp && <Text style={[ewsText.small, styles.center, { color: colors.error }]}>{errors.otp}</Text>}
      <Text style={[ewsText.small, styles.center, { color: colors.text.muted }]}>Demo code: {DEMO_OTP}</Text>
      <PrimaryButton label="Continue" onPress={() => verify()} disabled={otp.length < 4} />
      <Text style={[ewsText.body, styles.center, { color: colors.text.secondary }]}>
        Didn’t receive the code?{' '}
        {seconds > 0 ? (
          <Text style={{ color: colors.text.primary, fontFamily: theme.fonts.bold }}>Resend in 00:{String(seconds).padStart(2, '0')}</Text>
        ) : (
          <Text style={{ color: colors.accentPrimary, fontFamily: theme.fonts.bold }} onPress={() => setSeconds(RESEND_SECONDS)}>
            Resend
          </Text>
        )}
      </Text>
      <View style={[styles.alt, { borderTopColor: colors.border.hairline }]}>
        <LightButton label={`${elder} will confirm here`} onPress={() => onAgreed(proxy('assisted_confirm'))} />
        <HyperlinkButton
          label={`${elder} says no`}
          textColor={colors.accentPrimary}
          onPress={() => onDeclined(`${elder} has chosen not to do the check-in right now. That’s their choice.`)}
        />
        <HyperlinkButton
          label={`${elder} can’t make this decision`}
          textColor={colors.accentPrimary}
          onPress={() => onDeclined(`We can only do this check-in with ${elder}’s agreement or a legal guardian’s. Our helpline can guide you.`)}
        />
        <HyperlinkButton label="Change details" textColor={colors.accentPrimary} onPress={onBack} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    textAlign: 'center',
  },
  options: {
    gap: theme.spacing.sm,
  },
  more: {
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  moreHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flip: {
    transform: [{ rotate: '180deg' }],
  },
  bullets: {
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.sm,
  },
  field: {
    gap: theme.spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  alt: {
    gap: theme.spacing.xs,
    borderTopWidth: 1.5,
    paddingTop: theme.spacing.lg,
  },
});

export default SetupSheet;
