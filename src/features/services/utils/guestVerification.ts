import { ApiError, authService, guestService, VerifyOtpData } from '@/api';
import { useAuthStore } from '@/store/auth.store';
import { useUserStore } from '@/store/user.store';

// Shared by every guest "unlock" gate (GuestBrowseServicesScreen, LeadCaptureModal,
// UnlockComparisonSheet): all of them collect just a full name + phone, run
// guest/register -> otp/request -> otp/verify, and need the same thing done
// with the result.
//
// NOTE: a brand-new number is NOT registered via /auth/register here — that
// endpoint requires email + password, which these quick gates never collect
// (by design — they're meant to be a one-field, no-friction unlock). Instead
// registerGuest() below calls /guest/register (name + phone only), which
// creates the account up front so the otp/verify call that follows logs the
// guest in for real (accessToken + user) rather than leaving them as a
// phone-verified-but-accountless visitor.
//
// Kept as a fallback for now: if guest/register fails (e.g. the phone is
// already registered — see registerGuest) or a build is talking to a
// backend that predates this endpoint, otp/verify still won't return an
// accessToken for a brand-new number. STOPGAP for that case only: save the
// verified name+phone locally and flip isLocallyRegistered (see
// auth.store.ts) so the app treats them as done — deliberately NOT via
// setToken/isAuthenticated, since there's no real session to back it and a
// fake bearer token would break real API calls.

/** "Amit Kumar" -> { firstName: "Amit", lastName: "Kumar" } (single word -> empty lastName). */
export const splitFullName = (fullName: string): { firstName: string; lastName: string } => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] ?? '', lastName: parts.slice(1).join(' ') };
};

/**
 * Best-effort account creation for a guest unlock gate — call before
 * requesting the OTP. A 409 (confirmed backend contract, 2026-09-17:
 * `{ statusCode: 409, error: 'Conflict', message: 'A user with this phone
 * number already exists' }`) means this phone already has an account —
 * that's not a failure, it just means this guest is a returning user
 * continuing into their existing account rather than creating a new one,
 * so the OTP flow proceeds exactly the same way either way (otp/verify
 * already returns the real account for an existing phone, name and all —
 * see completeGuestVerification). Any other failure is swallowed too,
 * since a hiccup here must never block the OTP flow that already works
 * without it — but only a 409 is reported back as "known, expected".
 */
const registerGuest = async (fullName: string, phone: string): Promise<{ alreadyRegistered: boolean }> => {
  try {
    await guestService.register({ fullName: fullName.trim(), phone, role: useAuthStore.getState().role });
    return { alreadyRegistered: false };
  } catch (err) {
    return { alreadyRegistered: err instanceof ApiError && err.statusCode === 409 };
  }
};

/**
 * Registers the guest (best-effort) and sends the OTP — the first step of
 * every unlock gate. Returns whether this phone already belongs to an
 * account, so the caller can welcome a returning guest back instead of
 * implying a brand-new signup.
 */
export const registerGuestAndRequestOtp = async (
  fullName: string,
  phone: string,
): Promise<{ alreadyRegistered: boolean }> => {
  const { alreadyRegistered } = await registerGuest(fullName, phone);
  await authService.requestOtp({ phone, role: useAuthStore.getState().role });
  return { alreadyRegistered };
};

/** Finishes a guest phone-verification — see the file-level note above. */
export const completeGuestVerification = async (
  data: VerifyOtpData,
  fullName: string,
  phone: string,
): Promise<void> => {
  useAuthStore.getState().setPhoneVerification(data);

  if (data.accessToken) {
    // Existing account — /auth/otp/verify already logged it in for real.
    useAuthStore.getState().setToken(data.accessToken);
    useUserStore.getState().setProfile({
      name: data.user ? `${data.user.firstName} ${data.user.lastName}`.trim() : fullName.trim(),
      email: data.user?.email ?? '',
      phone: data.user?.phone ?? phone,
      role: null,
      age: '',
    });
  } else {
    // New phone — frontend-only stopgap save (see note above).
    useUserStore.getState().setProfile({ name: fullName.trim(), email: '', phone, role: null, age: '' });
    useAuthStore.getState().setLocallyRegistered(true);
  }
};
