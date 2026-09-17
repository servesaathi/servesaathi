// Public surface of the API layer — import from '@/api' everywhere.
export { apiClient } from './axios';
export { API_CONFIG, apiUrl } from './config';
export { ENDPOINTS } from './endpoints';
export { ApiError, getErrorMessage } from './types';
export type { ApiEnvelope, ApiErrorBody, ApiRole, User } from './types';
export { authService } from './services/auth.service';
export type {
  VerifyOtpData,
  RequestOtpPayload,
  VerifyOtpPayload,
  RegisterPayload,
  AuthResponse,
} from './services/auth.service';
export { careProfileService } from './services/careprofile.service';
export type {
  CareProfile,
  CareProfilePayload,
  HealthProfilePayload,
  LookupEntity,
  FamilyMember,
  FamilyMemberPayload,
  HealthProfile,
} from './services/careprofile.service';
export { customerService } from './services/customer.service';
export type { Address, AddressPayload } from './services/customer.service';
export { userService } from './services/user.service';
export type { UpdateMePayload } from './services/user.service';
export { masterdataService, normalizeMasterDataResponse } from './services/masterdata.service';
export { pincodeService, toTitleCase, normalizePlaceList } from './services/pincode.service';
export type { PincodeOffice } from './services/pincode.service';
export type { MasterDataOption } from './services/masterdata.service';
export { categoryService } from './services/category.service';
export type { Category, CategoriesQuery, PaginationMeta } from './services/category.service';
export { guestService } from './services/guest.service';
export type { GuestRegisterPayload, GuestRegisterData } from './services/guest.service';
