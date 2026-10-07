import { theme } from '@/theme';
import type { Organization } from './utils/providerMapping';

export * from './utils/providerMapping';
export * from './utils/categoryMapping';

// The API has no provider photos yet, so every screen shows *some* image
// rather than a bare grey box: one of these, chosen deterministically by the
// provider's id so a given provider always gets the same one.
const FALLBACK_IMAGES = [theme.images.onboarding1, theme.images.onboarding2, theme.images.onboarding3];

export const getOrgImage = (org: Pick<Organization, 'id'>): any =>
  FALLBACK_IMAGES[(Number(org.id) || 0) % FALLBACK_IMAGES.length];
