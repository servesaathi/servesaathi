import apiClient from '../axios';
import ENDPOINTS from '../endpoints';
import { ApiEnvelope, ApiRole } from '../types';

// POST /api/v1/guest/register — the phone-only quick-registration endpoint
// the guest "unlock" gates (GuestBrowseServicesScreen, LeadCaptureModal,
// UnlockComparisonSheet) call before requesting an OTP. It creates the
// account up front (name + phone only, no email/password) so the OTP-verify
// call that follows logs the guest in for real instead of falling back to
// the frontend-only stopgap — see guestVerification.ts.
export interface GuestRegisterPayload {
  fullName: string;
  phone: string;
  role: ApiRole;
}

export interface GuestRegisterData {
  userId: number;
  phone: string;
  phoneVerified: boolean;
  otpExpiresInSeconds: number;
}

export const guestService = {
  register: async (payload: GuestRegisterPayload): Promise<GuestRegisterData> => {
    const res = await apiClient.post<ApiEnvelope<GuestRegisterData>>(ENDPOINTS.guest.register, payload);
    return res.data.data;
  },
};

export default guestService;
