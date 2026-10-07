// Endpoint map, grouped by backend module. Paths are relative to
// API_CONFIG.baseUrl + API_CONFIG.prefix (see config.ts) — add new modules
// here instead of hardcoding URLs in services/screens.
export const ENDPOINTS = {
  auth: {
    otpRequest: '/auth/otp/request',
    otpVerify: '/auth/otp/verify',
    register: '/auth/register',
    refreshToken: '/auth/refresh',
    login: '/auth/login',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  guest: {
    register: '/guest/register',
  },
  users: {
    me: '/users/me',
  },
  customers: {
    me: '/customers/me',
    addresses: '/customers/me/addresses',
    address: (id: string | number) => `/customers/me/addresses/${id}`,
  },
  careProfiles: {
    me: '/care-profiles/me',
    health: '/care-profiles/me/health',
    familyMembers: '/care-profiles/me/family-members',
    familyMember: (id: string | number) => `/care-profiles/me/family-members/${id}`,
  },
  services: {
    list: '/services',
    details: (id: string) => `/services/${id}`,
  },
  providers: {
    list: '/providers',
    /** Full public profile incl. programs, services and recognitions — lives under the services module. */
    profile: (providerId: string | number) => `/services/providers/${providerId}/profile`,
    /** Public weekly hours. */
    availability: (providerId: string | number) => `/providers/${providerId}/availability`,
  },
  reviews: {
    /** GET = paginated list, PUT = create-or-update my review, DELETE = remove my review. */
    forProvider: (providerId: string | number) => `/reviews/provider/${providerId}`,
    mine: (providerId: string | number) => `/reviews/provider/${providerId}/me`,
  },
  favorites: {
    /** Signed-in user's saved providers. All three need a bearer token. */
    list: '/favorites',
    /** POST = save, DELETE = unsave; both 204 with no body. */
    item: (providerId: string | number) => `/favorites/${providerId}`,
  },
  categories: {
    list: '/categories',
  },
  pincodes: {
    cities: '/pincodes/cities',
    states: '/pincodes/states',
    lookup: (pincode: string) => `/pincodes/${pincode}`,
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
