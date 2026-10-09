import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '@/store/auth.store';
import { useUserStore } from '@/store/user.store';
import { sessionKeyFromToken } from '@/utils/sessionKey';
import { getInProgress, listHistory, type Assessment } from '../lib/ewsService';

// The signed-in user's EWS data (website: src/lib/ews/useEws.ts), reloaded
// whenever the screen using it regains focus so Home and the overview always
// reflect a check-in that was just saved, finished or deleted.

/**
 * Whose check-ins these are. A real session is keyed by the JWT `sub` (same
 * as favourites); the phone-only stopgap login has no token, so it falls back
 * to the verified phone. TODO(backend): the server derives this from the token.
 */
export const useEwsUserId = (): string => {
  const token = useAuthStore((s) => s.token);
  const phone = useAuthStore((s) => s.phone) ?? useUserStore.getState().profile?.phone ?? null;
  return sessionKeyFromToken(token) ?? (phone ? `phone:${phone.replace(/\D/g, '')}` : 'device');
};

export type EwsData = {
  status: 'loading' | 'ready';
  userId: string;
  /** Most recent completed check-in — drives empty state vs overview. */
  latest: Assessment | null;
  /** Unfinished check-in that can be resumed. */
  draft: Assessment | null;
  /** Completed check-ins, newest first. */
  history: Assessment[];
  refresh: () => void;
};

type Loaded = { userId: string; draft: Assessment | null; history: Assessment[] };

export function useEws(): EwsData {
  const userId = useEwsUserId();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  useFocusEffect(refresh);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listHistory(userId), getInProgress(userId)]).then(([history, draft]) => {
      if (!cancelled) setLoaded({ userId, draft, history });
    });
    return () => {
      cancelled = true;
    };
  }, [userId, version]);

  // Stale data for another user (or before the first load) counts as loading.
  if (!loaded || loaded.userId !== userId) {
    return { status: 'loading', userId, latest: null, draft: null, history: [], refresh };
  }
  return { status: 'ready', userId, latest: loaded.history[0] ?? null, draft: loaded.draft, history: loaded.history, refresh };
}
