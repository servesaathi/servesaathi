import type { PaginationMeta } from './category.service';

// Pure unwrapping for the paginated list endpoints (/categories, /providers,
// /reviews/provider/{id}, /favorites) — kept free of the axios import so it can
// be unit-tested (see __tests__/listResponse.test.ts).
//
// The Swagger doc describes the success shape as `data: { items, meta }`, but
// the live backend (verified 2026-10-07) returns `data` as the bare array with
// `meta` as a sibling of `data`. Both shapes are accepted.

export interface ListBody<T> {
  data: T[] | { items?: T[]; meta?: PaginationMeta } | null;
  meta?: PaginationMeta;
}

export const unwrapList = <T>(body: ListBody<T>): { items: T[]; meta: PaginationMeta } => {
  const { data } = body;
  const items = Array.isArray(data) ? data : (data?.items ?? []);
  const nestedMeta = Array.isArray(data) ? undefined : data?.meta;
  // /favorites isn't paginated, so it may come back with no meta at all.
  const meta = body.meta ?? nestedMeta ?? { total: items.length, page: 1, limit: items.length, totalPages: 1 };
  return { items, meta };
};
