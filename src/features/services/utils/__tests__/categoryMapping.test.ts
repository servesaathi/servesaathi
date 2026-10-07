import { describe, expect, it } from '@jest/globals';
import type { Category } from '@/api';
import { iconForCategorySlug, toServiceCategories } from '../categoryMapping';

const category = (overrides: Partial<Category>): Category => ({
  id: 1,
  name: 'Assisted Living',
  slug: 'assisted-living',
  description: null,
  iconUrl: null,
  parentId: null,
  isActive: true,
  sortOrder: 0,
  createdAt: '2026-09-14T14:41:47.376Z',
  updatedAt: '2026-09-14T14:41:47.376Z',
  ...overrides,
});

describe('toServiceCategories', () => {
  it('keeps active top-level categories, sorted by sortOrder', () => {
    const result = toServiceCategories([
      category({ id: 5, name: 'Rehabilitation Centres', slug: 'rehabilitation-centres', sortOrder: 3 }),
      category({ id: 3, name: 'Assisted Living', slug: 'assisted-living', sortOrder: 1 }),
      category({ id: 9, name: 'Inactive', slug: 'inactive', sortOrder: 0, isActive: false }),
      category({ id: 10, name: 'Sub-category', slug: 'sub', sortOrder: 0, parentId: 3 }),
      // Seed junk is backend data — not filtered out here.
      category({ id: 2, name: 'Category 1', slug: 'category-1', sortOrder: 0 }),
    ]);
    expect(result.map((c) => c.id)).toEqual([2, 3, 5]);
  });

  it('maps onto the grid shape, keeping the real id for GET /providers?categoryId=', () => {
    expect(toServiceCategories([category({ id: 3 })])).toEqual([
      { id: 3, slug: 'assisted-living', label: 'Assisted Living', icon: 'homeSafety', iconUrl: null },
    ]);
  });

  it('passes iconUrl through when present, treating blank as missing', () => {
    expect(toServiceCategories([category({ iconUrl: 'https://cdn.example/x.png' })])[0].iconUrl).toBe(
      'https://cdn.example/x.png',
    );
    expect(toServiceCategories([category({ iconUrl: '  ' })])[0].iconUrl).toBeNull();
  });
});

describe('iconForCategorySlug', () => {
  it('falls back to a generic icon for unknown slugs', () => {
    expect(iconForCategorySlug('category-1')).toBe('service');
  });
});
