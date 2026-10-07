import apiClient from '../axios';
import ENDPOINTS from '../endpoints';
import { unwrapList, type ListBody } from './listResponse';
import type { ProviderSummary } from './provider.service';

// /api/v1/favorites — the signed-in customer's saved providers. Every call
// needs a bearer token (401 otherwise). POST/DELETE /favorites/{providerId}
// return 204 with no body.
//
// Swagger types GET as `data: Provider[]`; the response hasn't been checked
// with a real token yet, so the `{ items }` list shape is accepted too.

export const favoriteService = {
  list: async (): Promise<ProviderSummary[]> => {
    const res = await apiClient.get<ListBody<ProviderSummary>>(ENDPOINTS.favorites.list);
    return unwrapList(res.data).items;
  },

  add: async (providerId: number | string): Promise<void> => {
    await apiClient.post(ENDPOINTS.favorites.item(providerId));
  },

  remove: async (providerId: number | string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.favorites.item(providerId));
  },
};

export default favoriteService;
