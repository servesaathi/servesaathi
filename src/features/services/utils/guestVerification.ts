import { authService, VerifyOtpData } from '@/api';
import { useAuthStore } from '@/store/auth.store';
import { useUserStore } from '@/store/user.store';

// Shared by every guest "unlock" gate (GuestBrowseServicesScreen, LeadCaptureModal,
// UnlockComparisonSheet): all of them collect just a full name + phone, run
// otp/request -> otp/verify, and need the same thing done with the result —
// an existing number logs straight in, a new one needs one more call
// (/auth/register) to actually create + save the account before anything
// downstream can act "as that user".

/** "Amit Kumar" -> { firstName: "Amit", lastName: "Kumar" } (single word -> empty lastName). */
export const splitFullName = (fullName: string): { firstName: string; lastName: string } => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] ?? '', lastName: parts.slice(1).join(' ') };
};

/**
 * Finishes a guest phone-verification: registers brand-new numbers (name +
 * phone only — no email/password collected in these quick gates) or adopts
 * the session /auth/otp/verify already logged in for an existing account.
 * Either way, auth + user stores end up holding a real, saved account.
 */
export const completeGuestVerification = async (
  data: VerifyOtpData,
  fullName: string,
  phone: string,
): Promise<void> => {
  if (data.isNewUser) {
    const { role } = useAuthStore.getState();
    const { firstName, lastName } = splitFullName(fullName);
    const { accessToken, user } = await authService.register({
      firstName,
      lastName,
      phone,
      role,
      phoneVerificationToken: data.phoneVerificationToken,
    });
    useAuthStore.getState().setToken(accessToken);
    useUserStore.getState().setProfile({
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      phone: user.phone ?? phone,
      role: null,
      age: '',
    });
  } else {
    // Existing account — /auth/otp/verify already logged it in.
    useAuthStore.getState().setToken(data.accessToken ?? null);
    if (data.user) {
      useUserStore.getState().setProfile({
        name: `${data.user.firstName} ${data.user.lastName}`.trim(),
        email: data.user.email,
        phone: data.user.phone ?? phone,
        role: null,
        age: '',
      });
    }
  }
};
