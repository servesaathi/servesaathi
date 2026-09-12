import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme } from '@/theme';
import { Spacer } from '@/components/layouts';
import { PrimaryButton, IconButton } from '@/components/buttons';
import { TextInput as StyledTextInput, OTPInput } from '@/components/inputs';
import { Icon } from '@/components/icons';
import { responsiveFontSize } from '@/utils/responsive';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/store/auth.store';
import { authService, getErrorMessage } from '@/api';
import { completeGuestVerification } from '../utils/guestVerification';

// "Unlock the Full Comparison Matrix" (Figma 2895:78888) + "Enter verification code"
// (Figma 2895:79385) — the login gate a guest hits from GuestComparisonScreen's
// "View Full Comparison". Mobile + OTP unlocks in place; the social / "Log in"
// options hand off to the real auth screens.

const OTP_LENGTH = 4;
const RESEND_SECONDS = 28; // Figma copy: "Resend in 00:28"

const isValidIndianMobile = (v: string) => /^[6-9]\d{9}$/.test(v);

// "+919812340002" → "+91-98****02"
const maskPhone = (phone: string) => {
  const match = phone.match(/^(\+\d{1,3})(\d{10})$/);
  if (!match) return phone;
  const digits = match[2];
  return `${match[1]}-${digits.slice(0, 2)}****${digits.slice(8)}`;
};

const GoogleIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </Svg>
);

type Step = 'phone' | 'otp';

interface UnlockComparisonSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Fired once the number is verified — the host reveals the full comparison. */
  onVerified: () => void;
  onGoogle: () => void;
  onEmail: () => void;
  onLogin: () => void;
}

export const UnlockComparisonSheet: React.FC<UnlockComparisonSheetProps> = ({
  visible,
  onClose,
  onVerified,
  onGoogle,
  onEmail,
  onLogin,
}) => {
  const colors = useThemeColors();

  const [step, setStep] = useState<Step>('phone');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);

  const phone = `+91${mobile}`;

  // Clean slate every time the sheet is (re)opened.
  useEffect(() => {
    if (visible) {
      setStep('phone');
      setFullName('');
      setMobile('');
      setOtpCode('');
      setFormError(null);
      setOtpError(null);
      setResendIn(RESEND_SECONDS);
    }
  }, [visible]);

  useEffect(() => {
    if (step !== 'otp' || resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [step, resendIn]);

  const requestOtp = async () => {
    await authService.requestOtp({ phone, role: useAuthStore.getState().role });
  };

  const handleContinue = async () => {
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
      await requestOtp();
      useAuthStore.getState().setPhone(phone);
      setOtpCode('');
      setResendIn(RESEND_SECONDS);
      setStep('otp');
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (code: string = otpCode) => {
    if (submitting || code.length !== OTP_LENGTH) return;
    setSubmitting(true);
    setOtpError(null);
    try {
      const data = await authService.verifyOtp({ phone, code });
      useAuthStore.getState().setPhoneVerification(data);
      // New phone -> /auth/register saves the account; existing phone -> adopt
      // the session /auth/otp/verify already logged in. The comparison unlocks
      // as that now-real user either way.
      await completeGuestVerification(data, fullName, phone);

      onVerified();
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
      await requestOtp();
      setResendIn(RESEND_SECONDS);
    } catch (err) {
      setOtpError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.background.layout }]}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }} />
            <IconButton type="close" bg={colors.accentPrimary} accessibilityLabel="Close" onPress={onClose} size={40} />
          </View>

          {step === 'phone' && (
            <>
              <Spacer size="sm" />
              <Text style={[styles.title, { color: colors.text.primary }]}>Unlock the Full Comparison Matrix</Text>
              <Spacer size="md" />
              <Text style={[styles.body, { color: colors.text.secondary }]}>
                Enter your details below to instantly unlock the remaining providers and compare detailed
                specifications side-by-side.
              </Text>

              <Spacer size="lg" />
              <StyledTextInput
                label="Full Name"
                placeholder="Full Name"
                value={fullName}
                onChangeText={(v) => {
                  setFullName(v);
                  if (formError) setFormError(null);
                }}
                autoCapitalize="words"
              />

              <Spacer size="md" />
              <Text style={[styles.fieldLabel, { color: colors.text.primary }]}>Mobile Number</Text>
              <Spacer size="sm" />
              <View style={styles.phoneRow}>
                <View style={[styles.ccBox, { backgroundColor: colors.background.base, borderColor: colors.border.card }]}>
                  <Text style={[styles.ccText, { color: colors.text.primary }]}>(+91)</Text>
                  <Icon name="navigationDown" variant="outline" size={14} color={colors.text.secondary} />
                </View>
                <TextInput
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
              <PrimaryButton label="Continue" onPress={handleContinue} loading={submitting} />

              <Spacer size="lg" />
              <View style={styles.orRow}>
                <View style={[styles.orLine, { backgroundColor: colors.accentOrange }]} />
                <Text style={[styles.orText, { color: colors.text.secondary }]}>OR</Text>
                <View style={[styles.orLine, { backgroundColor: colors.accentOrange }]} />
              </View>

              <Spacer size="lg" />
              <Pressable
                style={[styles.lightButton, { backgroundColor: colors.background.base, borderColor: colors.border.hairline }]}
                onPress={onGoogle}
                accessibilityRole="button"
              >
                <GoogleIcon />
                <Text style={[styles.lightButtonText, { color: colors.text.primary }]}>Sign in with Google</Text>
              </Pressable>
              <Spacer size="md" />
              <Pressable
                style={[styles.lightButton, { backgroundColor: colors.background.base, borderColor: colors.border.hairline }]}
                onPress={onEmail}
                accessibilityRole="button"
              >
                <Text style={[styles.lightButtonText, { color: colors.text.primary }]}>Sign in with Email</Text>
              </Pressable>

              <Spacer size="lg" />
              <Text style={[styles.loginRow, { color: colors.text.secondary }]}>
                Already have an account?{' '}
                <Text style={[styles.loginLink, { color: colors.accentPrimary }]} onPress={onLogin}>
                  Log in
                </Text>
              </Text>
            </>
          )}

          {step === 'otp' && (
            <>
              <Spacer size="sm" />
              <Text style={[styles.title, { color: colors.text.primary }]}>Enter verification code</Text>
              <Spacer size="md" />
              <Text style={[styles.body, { color: colors.text.secondary }]}>
                The OTP has been sent to your verified mobile{' '}
                <Text style={[styles.bodyStrong, { color: colors.text.primary }]}>{maskPhone(phone)}</Text>
              </Text>

              <Spacer size="lg" />
              <OTPInput
                length={OTP_LENGTH}
                value={otpCode}
                onChange={(v) => {
                  setOtpCode(v);
                  if (otpError) setOtpError(null);
                }}
                onComplete={(code) => handleVerify(code)}
                error={!!otpError}
              />
              {otpError && (
                <>
                  <Spacer size="sm" />
                  <Text style={styles.errorText}>{otpError}</Text>
                </>
              )}

              <Spacer size="xl" />
              <PrimaryButton
                label="Continue"
                onPress={() => handleVerify()}
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

          <Spacer size="lg" />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(9, 25, 10, 0.9)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
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
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  orLine: {
    flex: 1,
    height: 1.5,
  },
  orText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(16),
  },
  lightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    minHeight: 48,
    paddingHorizontal: theme.spacing.xxl,
    borderWidth: 1,
    borderRadius: theme.radius.control,
  },
  lightButtonText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(16),
  },
  loginRow: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(15),
    textAlign: 'center',
  },
  loginLink: {
    fontFamily: theme.fonts.bold,
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

export default UnlockComparisonSheet;
