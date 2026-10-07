import apiClient from '../axios';
import ENDPOINTS from '../endpoints';
import { ApiEnvelope } from '../types';
import type { PaginationMeta } from './category.service';
import { unwrapList, type ListBody } from './listResponse';

// /api/v1/reviews/provider/{providerId} — verified live 2026-09-25.
//  - GET list is public; GET /me, PUT and DELETE need a bearer token (401 otherwise).
//  - One review per customer per provider: PUT is create-or-update, there is no POST.
//  - The backend recalculates the provider's averageRating / totalReviews on every write.

export interface Review {
  id: number;
  createdAt: string;
  updatedAt: string;
  customerId: number;
  /** Full name in list responses, but an empty string in the PUT/GET-me responses. */
  customerName: string;
  providerId: number;
  /** 1–5 */
  rating: number;
  comment: string | null;
}

export interface UpsertReviewPayload {
  rating: number;
  comment?: string;
}

export interface ReviewsQuery {
  page?: number;
  /** 1–100, default 20. */
  limit?: number;
  /** Only real columns — an unknown value makes the backend 500. */
  sortBy?: 'createdAt' | 'rating';
  sortOrder?: 'ASC' | 'DESC';
}


export const reviewService = {
  list: async (
    providerId: number | string,
    params?: ReviewsQuery
  ): Promise<{ items: Review[]; meta: PaginationMeta }> => {
    const res = await apiClient.get<ListBody<Review>>(ENDPOINTS.reviews.forProvider(providerId), { params });
    return unwrapList(res.data);
  },

  /** The signed-in customer's own review, or null when they haven't reviewed this provider (200, not 404). */
  getMine: async (providerId: number | string): Promise<Review | null> => {
    const res = await apiClient.get<ApiEnvelope<Review | null>>(ENDPOINTS.reviews.mine(providerId));
    return res.data.data;
  },

  /** Creates the review, or replaces the existing one. `comment` may be omitted (stored as null). */
  upsert: async (providerId: number | string, payload: UpsertReviewPayload): Promise<Review> => {
    const res = await apiClient.put<ApiEnvelope<Review>>(ENDPOINTS.reviews.forProvider(providerId), payload);
    return res.data.data;
  },

  /** Removes my review; 404 "Review not found" if there isn't one. */
  remove: async (providerId: number | string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.reviews.forProvider(providerId));
  },
};

export default reviewService;
