import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, favoriteService } from '@/api';
import { useAuthStore } from '@/store/auth.store';
import { sessionKeyFromToken } from '@/utils/sessionKey';
import { applyFavoriteToggle } from '../utils/favorites';

// Server state for the signed-in user's saved providers (GET/POST/DELETE /favorites).
//
// Loaded once per account (staleTime: Infinity), keyed by the account behind
// the token (see utils/sessionKey.ts), then kept in sync by optimistic toggles.
// clearFavoritesOnSessionChange drops the cache on logout / account switch.
// Every call needs a real token — a guest or a locally-registered visitor
// (isLocallyRegistered, no token) has no favourites query at all.

export const favoriteKeys = {
  all: ['favorites'] as const,
  list: (sessionKey: string) => ['favorites', 'list', sessionKey] as const,
};

const currentSessionKey = () => sessionKeyFromToken(useAuthStore.getState().token);

/** Ids (as strings, matching Organization.id) of the providers the signed-in user has saved. */
export const useFavorites = () => {
  const sessionKey = useAuthStore((s) => sessionKeyFromToken(s.token));
  return useQuery({
    queryKey: favoriteKeys.list(sessionKey ?? 'signed-out'),
    queryFn: async () => (await favoriteService.list()).map((p) => String(p.id)),
    enabled: sessionKey !== null,
    staleTime: Infinity,
  });
};

export const useIsFavorite = (providerId: string | undefined): boolean => {
  const { data } = useFavorites();
  return !!providerId && !!data?.includes(providerId);
};

interface ToggleFavoriteVars {
  providerId: string;
  /** true = save, false = unsave. Explicit rather than "flip", so a double tap can't invert the intent. */
  save: boolean;
}

/** Save / unsave a provider. Optimistic: the heart flips immediately and flips back if the request fails. */
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ providerId, save }: ToggleFavoriteVars) => {
      // Without a token the request would 401, and the axios interceptor
      // treats that as an expired session and logs out.
      if (!currentSessionKey()) throw new Error('Please sign in to save providers.');
      try {
        await (save ? favoriteService.add(providerId) : favoriteService.remove(providerId));
      } catch (err) {
        // Already in the requested state (e.g. saved earlier on another device) is not a failure.
        const alreadyDone = err instanceof ApiError && err.statusCode === (save ? 409 : 404);
        if (!alreadyDone) throw err;
      }
    },
    onMutate: async ({ providerId, save }) => {
      const sessionKey = currentSessionKey();
      if (!sessionKey) return undefined;
      const key = favoriteKeys.list(sessionKey);
      await queryClient.cancelQueries({ queryKey: key });
      const loaded = queryClient.getQueryData<string[]>(key) !== undefined;
      if (loaded) queryClient.setQueryData<string[]>(key, (ids) => applyFavoriteToggle(ids ?? [], providerId, save));
      return { key, loaded };
    },
    onError: (_err, { providerId, save }, context) => {
      // Undo just this toggle, so a concurrent toggle of another provider survives.
      if (context?.loaded) {
        queryClient.setQueryData<string[]>(context.key, (ids) => applyFavoriteToggle(ids ?? [], providerId, !save));
      }
    },
    onSuccess: (_data, _vars, context) => {
      // Nothing was cached to patch (e.g. the user only just signed in via OTP) — fetch the real list.
      if (context && !context.loaded) return queryClient.invalidateQueries({ queryKey: context.key });
    },
  });
};

/**
 * Drops cached favourites whenever the signed-in account changes — logout, or a
 * different account signing in. A token refresh for the same user keeps them.
 * Call once at startup; returns the unsubscribe function.
 */
export const clearFavoritesOnSessionChange = (queryClient: QueryClient) =>
  useAuthStore.subscribe((state, prev) => {
    if (sessionKeyFromToken(state.token) !== sessionKeyFromToken(prev.token)) {
      queryClient.removeQueries({ queryKey: favoriteKeys.all });
    }
  });
