import apiClient from '../axios';
import ENDPOINTS from '../endpoints';
import { ApiEnvelope } from '../types';
import type { Category, PaginationMeta } from './category.service';
import { unwrapList, type ListBody } from './listResponse';

// GET /api/v1/providers            — public list (summary rows)
// GET /api/v1/services/providers/{providerId}/profile — public full profile
// GET /api/v1/providers/{providerId}/availability    — public weekly hours
// All verified against the live backend (list/profile 2026-09-25, availability
// 2026-10-07); none needs a token.

export interface ProvidersQuery {
  page?: number;
  limit?: number;
  /** Only real columns — an unknown value makes the backend 500. */
  sortBy?: 'averageRating' | 'yearsOfExperience' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
  city?: string;
  categoryId?: number;
  /** Only providers whose service area covers this pincode. */
  pincode?: string;
}

/** A row of GET /providers. Only `id` is relied on by the app — the card content comes from the profile. */
export interface ProviderSummary {
  id: number;
  userId: number;
  verificationStatus: string;
  legalName: string | null;
  city: string;
  pincodes: string[];
  averageRating: number;
  totalReviews: number;
  isAvailable: boolean;
  categories: Pick<Category, 'id' | 'name' | 'slug'>[];
}

export interface ProviderServiceItem {
  id: number;
  serviceId: number;
  serviceName: string;
  serviceDescription: string | null;
  category: Category;
  /** Provider override, or the catalog base price. */
  effectivePrice: number;
  effectiveDurationMinutes: number;
  /** How the price is billed, e.g. "Per Hour". */
  priceTypeLabel: string | null;
}

export interface ProviderFaq {
  question: string;
  answer: string;
}

export interface ProviderRecognition {
  title: string;
  description: string | null;
}

export interface ProviderProfile {
  id: number;
  legalName: string | null;
  /** Documented in the OpenAPI schema but absent from live responses so far — treat as optional. */
  firstName?: string;
  lastName?: string;
  city: string;
  registeredAddress: string | null;
  pincodes: string[];
  /** 0 when the provider has no reviews yet. */
  averageRating: number;
  totalReviews: number;
  /** e.g. 27 -> "27+ yrs" */
  yearsOfExperience: number | null;
  /** e.g. 25000 -> "25,000+ Visits done" */
  experienceCount: number | null;
  isAvailable: boolean;
  bedsAvailable: boolean;
  bio: string | null;
  /** The "About the facility" paragraph. */
  aboutText: string | null;
  keyFacts: string[];
  websiteUrl: string | null;
  categories: { id: number; name: string }[];
  programs: { id: number; name: string }[];
  servicesProvided: ProviderServiceItem[];
  recognitions: ProviderRecognition[];
  faqs?: ProviderFaq[];
}

/** One weekly slot of GET /providers/{id}/availability. Unknown id -> `data: []`, not a 404. */
export interface ProviderAvailability {
  id: number;
  providerId: number;
  /** 0 = Sunday … 6 = Saturday */
  dayOfWeek: number;
  /** "09:00" */
  startTime: string;
  /** "17:00" */
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
}

export const providerService = {
  getProviders: async (
    params?: ProvidersQuery
  ): Promise<{ items: ProviderSummary[]; meta: PaginationMeta }> => {
    const res = await apiClient.get<ListBody<ProviderSummary>>(ENDPOINTS.providers.list, { params });
    return unwrapList(res.data);
  },

  /** 404s with "Provider not found" for an unknown id. */
  getProfile: async (providerId: number | string): Promise<ProviderProfile> => {
    const res = await apiClient.get<ApiEnvelope<ProviderProfile>>(ENDPOINTS.providers.profile(providerId));
    return res.data.data;
  },

  getAvailability: async (providerId: number | string): Promise<ProviderAvailability[]> => {
    const res = await apiClient.get<ApiEnvelope<ProviderAvailability[] | null>>(
      ENDPOINTS.providers.availability(providerId)
    );
    return res.data.data ?? [];
  },
};

export default providerService;
