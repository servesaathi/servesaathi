// Public surface of the API layer — import from '@/api' everywhere.
export { apiClient } from './axios';
export { API_CONFIG, apiUrl } from './config';
export { ENDPOINTS } from './endpoints';
export { ApiError, getErrorMessage } from './types';
export type { ApiEnvelope, ApiErrorBody, ApiRole } from './types';
export { authService } from './services/auth.service';
export type { VerifyOtpData, RequestOtpPayload, VerifyOtpPayload } from './services/auth.service';
export { customerService } from './services/customer.service';
export type { Address, AddressPayload } from './services/customer.service';
export { masterdataService, normalizeMasterDataResponse } from './services/masterdata.service';
export type { MasterDataOption } from './services/masterdata.service';
