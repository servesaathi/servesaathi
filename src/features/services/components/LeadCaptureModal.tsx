import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
} from 'react-native';
import { theme } from '@/theme';
import { Spacer } from '@/components/layouts';
import { PrimaryButton, IconButton } from '@/components/buttons';
import { TextInput, OTPInput } from '@/components/inputs';
import { Icon } from '@/components/icons';
import { responsiveFontSize } from '@/utils/responsive';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/store/auth.store';
import { authService, getErrorMessage } from '@/api';
import { completeGuestVerification, registerGuestAndRequestOtp } from '../utils/guestVerification';

// Provider-detail lead-capture popups reached after "unlocking all providers":
// Save (Figma 2895:69194 → 69265/69291 → 69321), Request a callback
// (2895:69217 → 69405/69431 → 69341) and Book/Enquire (2895:69241 → 69461/69487,
// then straight into Request Set up — no "done" step of its own). All three
// share the same name+mobile → OTP shape, just with different copy per Figma.

export type LeadCaptureMode = 'save' | 'callback' | 'book';

const OTP_LENGTH = 4;
const RESEND_SECONDS = 28; // Figma copy: "Resend in 00:28"

const COPY: Record<LeadCaptureMode, {
  title: string;
  body: string;
  submitLabel: string;
  disclaimer: string;
  doneTitle: string;
  doneBody: string;
  doneButtonLabel: string;
}> = {
  save: {
    title: 'Save This Provider to Your Favorites',
    body: 'Create a secure shortlist so you can access your saved providers and compare them later from any device.',
    submitLabel: 'Continue',
    disclaimer: 'Standard message and data rates may app. We take steps to ensure your data stays private.',
    doneTitle: 'Saved to Favorites',
    doneBody: 'You can find your saved items anytime from your Service History.',
    doneButtonLabel: 'Continue browsing',
  },
  callback: {
    title: 'Get a Callback Within 15 Minutes',
    body: 'Leave your name and number below, and an expert from this provider will call you directly.',
    submitLabel: 'Call Me Back',
    disclaimer: 'Agents are currently online and available to call.',
    doneTitle: 'Callback requested',
    doneBody: "We've received your request. Our team will contact you shortly.",
    doneButtonLabel: 'Done',
  },
  book: {
    title: 'Let’s get you started',
    body: 'Enter your details and we’ll help you with your enquiry.',
    submitLabel: 'Call Me Back',
    disclaimer: 'Agents are currently online and available to call.',
    doneTitle: '',
    doneBody: '',
    doneButtonLabel: '',
  },
};

// "+919812340002" → "+91-98****02"
const maskPhone = (phone: string) => {
  const match = phone.match(/^(\+\d{1,3})(\d{10})$/);
  if (!match) return phone;
  const digits = match[2];
  return `${match[1]}-${digits.slice(0, 2)}****${digits.slice(8)}`;
};

const isValidIndianMobile = (v: string) => /^[6-9]\d{9}$/.test(v);

type Step = 'form' | 'otp' | 'done';

interface LeadCaptureModalProps {
  visible: boolean;
  mode: LeadCaptureMode;
  onClose: () => void;
  /**
   * Fired once the mobile number is verified. For 'save'/'callback' this is
   * called when the user taps the done-screen button (which also closes the
   * modal). For 'book' there's no done screen in Figma — it's called (and the
   * modal closes) right after OTP verification so the caller can move on to
   * Request Set up.
   */
  onVerified: (details: { name: string; phone: string }) => void;
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({ visible, mode, onClose, onVerified }) => {
  const colors = useThemeColors();
  const copy = COPY[mode];

  const [step, setStep] = useState<Step>('form');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  // Set when guest/register comes back 409 "already exists" — this phone
  // already has an account, so the OTP step welcomes them back instead of
  // implying a brand-new signup (see registerGuestAndRequestOtp).
  const [returningGuest, setReturningGuest] = useState(false);

  const phone = `+91${mobile}`;

  // Reset to a clean form every time the popup is (re)opened.
  useEffect(() => {
    if (visible) {
      setStep('form');
      setFullName('');
      setMobile('');
      setOtpCode('');
      setFormError(null);
      setOtpError(null);
      setResendIn(RESEND_SECONDS);
      setReturningGuest(false);
    }
  }, [visible, mode]);

  useEffect(() => {
    if (step !== 'otp' || resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [step, resendIn]);

  const handleSubmitDetails = async () => {
    if (submitting) return;
    if (!fullName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!isValidIndianMobile(mobile)) {
      setFormError('Enter a valid 10-digit mobile number starting with 6–9.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const { alreadyRegistered } = await registerGuestAndRequestOtp(fullName, phone);
      setReturningGuest(alreadyRegistered);
      setOtpCode('');
      setResendIn(RESEND_SECONDS);
      setStep('otp');
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (code: string = otpCode) => {
    if (submitting || code.length !== OTP_LENGTH) return;
    setSubmitting(true);
    setOtpError(null);
    try {
      const data = await authService.verifyOtp({ phone, code });
      // Existing phone -> logs in for real; new phone -> stays a verified
      // guest (no /auth/register call — it needs email/password we don't
      // collect here; see guestVerification.ts).
      await completeGuestVerification(data, fullName, phone);

      const details = { name: fullName.trim(), phone };
      if (mode === 'book') {
        onVerified(details);
      } else {
        setStep('done');
      }
    } catch (err) {
      setOtpError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0 || submitting) return;
    setSubmitting(true);
    setOtpError(null);
    setOtpCode('');
    try {
      await authService.requestOtp({ phone, role: useAuthStore.getState().role });
      setResendIn(RESEND_SECONDS);
    } catch (err) {
      setOtpError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDone = () => {
    onVerified({ name: fullName.trim(), phone });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.card, { backgroundColor: colors.background.layout }]}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }} />
            <IconButton type="close" bg={colors.accentPrimary} accessibilityLabel="Close" onPress={onClose} size={40} />
          </View>

          {step === 'form' && (
            <>
              <Spacer size="sm" />
              <Text style={[styles.title, { color: colors.text.primary }]}>{copy.title}</Text>
              <Spacer size="md" />
              <Text style={[styles.body, { color: colors.text.secondary }]}>{copy.body}</Text>
              <Spacer size="lg" />

              <TextInput
                label="Full Name"
                placeholder="Full Name"
                value={fullName}
                onChangeText={(v) => {
                  setFullName(v);
                  if (formError) setFormError(null);
                }}
                autoCapitalize="words"
              />

              <Text style={[styles.fieldLabel, { color: colors.text.primary }]}>Mobile Number</Text>
              <Spacer size="sm" />
              <View style={styles.phoneRow}>
                <View style={[styles.ccBox, { backgroundColor: colors.background.base, borderColor: colors.border.card }]}>
                  <Text style={[styles.ccText, { color: colors.text.primary }]}>(+91)</Text>
                  <Icon name="navigationDown" variant="outline" size={14} color={colors.text.secondary} />
                </View>
                <RNTextInput
                  style={[
                    styles.numInput,
                    { backgroundColor: colors.background.base, borderColor: colors.border.card, color: colors.text.primary },
                  ]}
                  placeholder="000-000-0000"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="number-pad"
                  maxLength={10}
                  value={mobile}
                  onChangeText={(v) => {
                    setMobile(v.replace(/\D/g, '').slice(0, 10));
                    if (formError) setFormError(null);
                  }}
                />
              </View>
              {formError && (
                <>
                  <Spacer size="sm" />
                  <Text style={styles.errorText}>{formError}</Text>
                </>
              )}

              <Spacer size="md" />
              <PrimaryButton label={copy.submitLabel} onPress={handleSubmitDetails} loading={submitting} />
              <Spacer size="lg" />
              <Text style={[styles.disclaimer, { color: colors.text.tertiary }]}>{copy.disclaimer}</Text>
            </>
          )}

          {step === 'otp' && (
            <>
              <Spacer size="sm" />
              <Text style={[styles.title, { color: colors.text.primary }]}>
                {returningGuest ? 'Welcome back!' : 'Enter verification code'}
              </Text>
              <Spacer size="md" />
              <Text style={[styles.body, { color: colors.text.secondary }]}>
                {returningGuest
                  ? 'Looks like you already have an account with this number. Enter the OTP sent to '
                  : 'The OTP has been sent to your verified mobile '}
                <Text style={[styles.bodyStrong, { color: colors.text.primary }]}>{maskPhone(phone)}</Text>
                {returningGuest ? ' to continue.' : ''}
              </Text>

              <Spacer size="lg" />
              <OTPInput
                length={OTP_LENGTH}
                value={otpCode}
                onChange={(v) => {
                  setOtpCode(v);
                  if (otpError) setOtpError(null);
                }}
                onComplete={(code) => handleVerifyOtp(code)}
                error={!!otpError}
              />
              {otpError && (
                <>
                  <Spacer size="sm" />
                  <Text style={styles.errorText}>{otpError}</Text>
                </>
              )}

              <Spacer size="lg" />
              <PrimaryButton
                label="Continue"
                onPress={() => handleVerifyOtp()}
                loading={submitting}
                disabled={otpCode.length !== OTP_LENGTH}
              />

              <Spacer size="lg" />
              <Text style={[styles.resendText, { color: colors.text.secondary }]}>
                {"Didn't receive OTP? "}
                {resendIn > 0 ? (
                  <Text style={[styles.bodyStrong, { color: colors.text.primary }]}>
                    Resend in 00:{String(resendIn).padStart(2, '0')}
                  </Text>
                ) : (
                  <Text style={[styles.resendLink, { color: colors.accentPrimary }]} onPress={handleResend}>
                    {submitting ? 'Sending…' : 'Resend'}
                  </Text>
                )}
              </Text>
            </>
          )}

          {step === 'done' && (
            <>
              <Spacer size="sm" />
              <Text style={[styles.title, { color: colors.text.primary }]}>{copy.doneTitle}</Text>
              <Spacer size="md" />
              <Text style={[styles.body, { color: colors.text.secondary }]}>{copy.doneBody}</Text>
              <Spacer size="lg" />
              <PrimaryButton label={copy.doneButtonLabel} onPress={handleDone} />
            </>
          )}
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
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: theme.spacing.xxl,
    ...theme.shadows.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
    textAlign: 'center',
  },
  body: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    lineHeight: 22,
    textAlign: 'center',
  },
  bodyStrong: {
    fontFamily: theme.fonts.bold,
  },
  disclaimer: {
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontStyle: 'italic',
    fontSize: responsiveFontSize(13),
    lineHeight: 17,
    textAlign: 'center',
  },
  fieldLabel: {
    fontFamily: theme.typography.h5.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h5.fontSize),
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  ccBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    height: 48,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1.5,
    borderTopLeftRadius: theme.radius.control,
    borderBottomLeftRadius: theme.radius.control,
  },
  ccText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(16),
  },
  numInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1.5,
    borderLeftWidth: 0,
    borderTopRightRadius: theme.radius.control,
    borderBottomRightRadius: theme.radius.control,
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(16),
  },
  errorText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(14),
    color: theme.colors.status.error,
    textAlign: 'center',
  },
  resendText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(15),
    textAlign: 'center',
  },
  resendLink: {
    fontFamily: theme.fonts.bold,
  },
});

export default LeadCaptureModal;
