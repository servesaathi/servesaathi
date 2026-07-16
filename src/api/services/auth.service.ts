import apiClient from '../axios';
import ENDPOINTS from '../endpoints';
import { ApiEnvelope, ApiRole } from '../types';

export interface RequestOtpPayload {
  /** E.164 format, e.g. "+919777729450". */
  phone: string;
  role: ApiRole;
}

export interface VerifyOtpPayload {
  phone: string;
  code: string;
}

export interface VerifyOtpData {
  isNewUser: boolean;
  phoneVerificationToken: string;
}

export const authService = {
  /** Sends an OTP to the given phone. */
  requestOtp: async (payload: RequestOtpPayload): Promise<void> => {
    await apiClient.post<ApiEnvelope<unknown>>(ENDPOINTS.auth.otpRequest, payload);
  },

  /** Verifies the OTP; throws ApiError(401) for a wrong/expired code. */
  verifyOtp: async (payload: VerifyOtpPayload): Promise<VerifyOtpData> => {
    const res = await apiClient.post<ApiEnvelope<VerifyOtpData>>(
      ENDPOINTS.auth.otpVerify,
      payload
    );
    return res.data.data;
  },
};

export default authService;
