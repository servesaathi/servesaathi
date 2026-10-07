// Pure helpers for the favourites cache — see __tests__/favorites.test.ts.

/** The saved-provider id list with `providerId` saved (or unsaved), without duplicates. */
export const applyFavoriteToggle = (ids: string[], providerId: string, save: boolean): string[] => {
  const without = ids.filter((id) => id !== providerId);
  return save ? [...without, providerId] : without;
};
