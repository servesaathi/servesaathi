import { describe, expect, it } from '@jest/globals';
import { unwrapList } from '../listResponse';

const meta = { total: 2, page: 1, limit: 20, totalPages: 1 };

describe('unwrapList', () => {
  it('reads the live shape: data is the array, meta is its sibling', () => {
    expect(unwrapList({ data: [{ id: 1 }, { id: 2 }], meta })).toEqual({ items: [{ id: 1 }, { id: 2 }], meta });
  });

  it('reads the Swagger shape: data is { items, meta }', () => {
    expect(unwrapList({ data: { items: [{ id: 1 }, { id: 2 }], meta } })).toEqual({
      items: [{ id: 1 }, { id: 2 }],
      meta,
    });
  });

  it('prefers the sibling meta when both are present', () => {
    const sibling = { total: 9, page: 2, limit: 1, totalPages: 9 };
    expect(unwrapList({ data: { items: [{ id: 1 }], meta }, meta: sibling }).meta).toEqual(sibling);
  });

  it('synthesizes meta for a bare array without one (e.g. GET /favorites)', () => {
    expect(unwrapList({ data: [{ id: 7 }] })).toEqual({
      items: [{ id: 7 }],
      meta: { total: 1, page: 1, limit: 1, totalPages: 1 },
    });
  });

  it('treats a missing or null payload as an empty list', () => {
    expect(unwrapList({ data: null }).items).toEqual([]);
    expect(unwrapList({ data: {} }).items).toEqual([]);
  });
});
