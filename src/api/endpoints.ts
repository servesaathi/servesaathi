// Endpoint map, grouped by backend module. Paths are relative to
// API_CONFIG.baseUrl + API_CONFIG.prefix (see config.ts) — add new modules
// here instead of hardcoding URLs in services/screens.
export const ENDPOINTS = {
  auth: {
    otpRequest: '/auth/otp/request',
    otpVerify: '/auth/otp/verify',
    register: '/auth/register',
    refreshToken: '/auth/refresh',
  },
  customers: {
    me: '/customers/me',
    addresses: '/customers/me/addresses',
    address: (id: string) => `/customers/me/addresses/${id}`,
  },
  services: {
    list: '/services',
    details: (id: string) => `/services/${id}`,
  },
  masterData: {
    languages: '/languages',
    genders: '/genders',
    livingSituations: '/living-situations',
    dependencyLevels: '/dependency-levels',
    interests: '/interests',
    colorContrasts: '/color-contrasts',
    medicalConditions: '/medical-conditions',
    mobilitySupports: '/mobility-supports',
    cognitiveConditions: '/cognitive-conditions',
    familyRelationships: '/family-relationships',
  },
} as const;

export default ENDPOINTS;
