// Central API configuration.
// Values come from EXPO_PUBLIC_* env vars (see .env.development / .env.staging /
// .env.production). Only EXPO_PUBLIC_-prefixed vars are inlined into the app
// bundle by Expo, so plain API_URL etc. would be undefined at runtime.
const DEFAULT_BASE_URL = 'https://powderblue-rook-471609.hostingersite.com';

export const API_CONFIG = {
  /** API origin, no trailing slash and no path prefix. */
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_BASE_URL,
  /** Version prefix shared by every endpoint. */
  prefix: '/api/v1',
  timeout: 15000,
  appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
  enableLogs: (process.env.EXPO_PUBLIC_ENABLE_LOGS ?? 'true') === 'true',
} as const;

/** Absolute URL for an endpoint path, e.g. apiUrl('/auth/otp/request'). */
export const apiUrl = (path: string) => `${API_CONFIG.baseUrl}${API_CONFIG.prefix}${path}`;
