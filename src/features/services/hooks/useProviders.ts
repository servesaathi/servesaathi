import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  categoryService,
  providerService,
  reviewService,
  type ProviderProfile,
  type Review,
  type UpsertReviewPayload,
} from '@/api';
import { useAuthStore } from '@/store/auth.store';
import { Organization, placeholderOrganization, toOrganization, toServiceCategories } from '../data';
import { toWeeklyAvailability } from '../utils/availability';

// Server state for the provider screens (browse list, comparison, details, reviews).
//
// The list is built from two calls: GET /providers for the ids, then
// GET /services/providers/{id}/profile for each. Profiles are cached per id
// (PROFILE_STALE_MS), so the comparison and detail screens reached from the
// list open instantly without another round trip.

const PROFILE_STALE_MS = 5 * 60 * 1000;
const CATEGORIES_STALE_MS = 10 * 60 * 1000;
/** /providers caps `limit` at 100. */
const LIST_LIMIT = 100;
/** Most reviews shown under "Recent Feedback" before the user taps View All. */
export const RECENT_REVIEWS_LIMIT = 5;
/** Backend cap for `limit` on GET /reviews/provider/{id}. */
export const ALL_REVIEWS_LIMIT = 100;

export const providerKeys = {
  list: (categoryId?: number) => ['providers', 'list', categoryId ?? 'all'] as const,
  profile: (id: string | number) => ['providers', 'profile', String(id)] as const,
  reviews: (id: string | number, limit: number) => ['providers', 'reviews', String(id), limit] as const,
  myReview: (id: string | number) => ['providers', 'my-review', String(id)] as const,
  availability: (id: string | number) => ['providers', 'availability', String(id)] as const,
};

export const categoryKeys = {
  list: ['categories', 'list'] as const,
};

/** The "What do you need help with?" grid: active top-level categories, in sortOrder. */
export const useServiceCategories = () =>
  useQuery({
    queryKey: categoryKeys.list,
    queryFn: async () => {
      const { items } = await categoryService.getCategories({
        isActive: true,
        sortBy: 'sortOrder',
        sortOrder: 'ASC',
        limit: 100,
      });
      return toServiceCategories(items);
    },
    staleTime: CATEGORIES_STALE_MS,
  });

const profileQuery = (id: string | number) => ({
  queryKey: providerKeys.profile(id),
  queryFn: () => providerService.getProfile(id),
  staleTime: PROFILE_STALE_MS,
});

/** Every provider (optionally within one category) as list/comparison rows. */
export const useProviderOrgs = (categoryId?: number, enabled = true) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: providerKeys.list(categoryId),
    enabled,
    queryFn: async (): Promise<Organization[]> => {
      const { items } = await providerService.getProviders({ limit: LIST_LIMIT, categoryId });
      const settled = await Promise.allSettled(items.map((p) => queryClient.fetchQuery(profileQuery(p.id))));
      const profiles = settled.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
      // A single broken profile just drops that card; only fail the screen when nothing loaded.
      if (items.length > 0 && profiles.length === 0) {
        const failed = settled.find((r): r is PromiseRejectedResult => r.status === 'rejected');
        throw failed?.reason ?? new Error('Unable to load providers.');
      }
      return profiles.map(toOrganization);
    },
  });
};

/** Full profile of one provider — the "See details" screen. */
export const useProviderProfile = (id: string | undefined) =>
  useQuery<ProviderProfile>({ ...profileQuery(id ?? ''), enabled: !!id });

/** One provider as an Organization — for screens that render before the profile arrives, so it is never undefined. */
export const useOrganization = (id: string | undefined): Organization => {
  const { data } = useProviderProfile(id);
  return data ? toOrganization(data) : placeholderOrganization(id ?? '');
};

/** Comparison columns, in the order of `ids`. Ids that fail to load are left out. */
export const useOrganizations = (ids: string[]) => {
  const results = useQueries({ queries: ids.map(profileQuery) });
  const orgs = results.flatMap((r) => (r.data ? [toOrganization(r.data)] : []));
  return {
    orgs,
    isLoading: results.some((r) => r.isLoading),
    isError: results.length > 0 && results.every((r) => r.isError),
    refetch: () => results.forEach((r) => r.refetch()),
  };
};

/** Weekly hours, Monday→Sunday — null when the provider hasn't published any. */
export const useProviderAvailability = (id: string | undefined) =>
  useQuery({
    queryKey: providerKeys.availability(id ?? ''),
    queryFn: async () => toWeeklyAvailability(await providerService.getAvailability(id!)),
    enabled: !!id,
    staleTime: PROFILE_STALE_MS,
  });

/** Public reviews for a provider, newest first. */
export const useProviderReviews = (id: string | undefined, limit: number) =>
  useQuery({
    queryKey: providerKeys.reviews(id ?? '', limit),
    queryFn: () => reviewService.list(id!, { limit, sortBy: 'createdAt', sortOrder: 'DESC' }),
    enabled: !!id,
  });

/** The signed-in customer's own review (null = hasn't reviewed). Skipped without a real session — the endpoint 401s. */
export const useMyReview = (id: string | undefined) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery<Review | null>({
    queryKey: providerKeys.myReview(id ?? ''),
    queryFn: () => reviewService.getMine(id!),
    enabled: !!id && isAuthenticated,
  });
};

// A review write changes the provider's averageRating/totalReviews server-side,
// so the public review list, the profile and every list built from it go stale.
const useInvalidateAfterReviewWrite = (id: string) => {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['providers', 'reviews', id] }),
      queryClient.invalidateQueries({ queryKey: providerKeys.profile(id) }),
      queryClient.invalidateQueries({ queryKey: ['providers', 'list'] }),
    ]);
};

/** Add my review, or edit it — the backend treats both as the same PUT. */
export const useSaveReview = (id: string) => {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateAfterReviewWrite(id);
  return useMutation({
    mutationFn: (payload: UpsertReviewPayload) => reviewService.upsert(id, payload),
    onSuccess: (review) => {
      queryClient.setQueryData(providerKeys.myReview(id), review);
      return invalidate();
    },
  });
};

export const useDeleteReview = (id: string) => {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateAfterReviewWrite(id);
  return useMutation({
    mutationFn: () => reviewService.remove(id),
    onSuccess: () => {
      queryClient.setQueryData(providerKeys.myReview(id), null);
      return invalidate();
    },
  });
};
