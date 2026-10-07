// Identifies whose session a bearer token belongs to, so per-user server state
// (e.g. the favourites query) can be keyed by account rather than by the raw
// token. Pure — see __tests__/sessionKey.test.ts.
//
// The backend's access token is a JWT; its `sub` claim (or `id`/`userId`) is
// the user id, which stays the same across token refreshes. A token that can't
// be decoded falls back to a short hash of the token itself — still distinct
// per session, and never puts the raw token into a cache key.

const decodeBase64Url = (segment: string): string => {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return atob(padded);
};

const hashString = (value: string): string => {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) hash = ((hash << 5) + hash + value.charCodeAt(i)) | 0;
  return (hash >>> 0).toString(36);
};

/** "user:42" for a JWT whose `sub` is 42; null when signed out. */
export const sessionKeyFromToken = (token: string | null | undefined): string | null => {
  if (!token) return null;
  try {
    const payload = JSON.parse(decodeBase64Url(token.split('.')[1] ?? ''));
    const id = payload?.sub ?? payload?.id ?? payload?.userId;
    if (id !== undefined && id !== null && id !== '') return `user:${id}`;
  } catch {
    // Not a JWT — fall through to the hash.
  }
  return `token:${hashString(token)}`;
};
