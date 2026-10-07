import type { Category } from '@/api';
import type { IconName } from '@/components/icons';

// Pure mapping from GET /categories onto the "What do you need help with?"
// grid — see __tests__/categoryMapping.test.ts. data.ts re-exports everything here.

export interface ServiceCategory {
  /** Backend category id — filters GET /providers?categoryId=. */
  id: number;
  slug: string;
  label: string;
  /** App icon used when the category has no iconUrl (every category, as of 2026-10-07). */
  icon: IconName;
  iconUrl: string | null;
}

// Fallback icons by slug, so categories keep a Figma icon until the backend
// serves iconUrl. The first block is the Figma grid's own categories (none is
// seeded yet); the second is what GET /categories returned on 2026-09-17.
// Unrecognized slugs get DEFAULT_CATEGORY_ICON.
const CATEGORY_ICON_BY_SLUG: Record<string, IconName> = {
  infrastructure: 'group',
  courses: 'book',
  experts: 'experts',
  events: 'events',
  social: 'socialEvents',
  'social-events': 'socialEvents',
  products: 'products',
  services: 'service',
  travel: 'passport',
  usp: 'usp',
  'diagnostic-centres': 'medicine',
  'palliative-care': 'nursing',
  'rehabilitation-centres': 'rehabilitationCare',
  'retirement-communities': 'home',
  'assisted-living': 'homeSafety',
};
const DEFAULT_CATEGORY_ICON: IconName = 'service';

export const iconForCategorySlug = (slug: string): IconName =>
  CATEGORY_ICON_BY_SLUG[slug] ?? DEFAULT_CATEGORY_ICON;

/** Active top-level categories (parentId === null), in the backend's sortOrder. */
export const toServiceCategories = (categories: Category[]): ServiceCategory[] =>
  categories
    .filter((c) => c.isActive && c.parentId === null)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      label: c.name,
      icon: iconForCategorySlug(c.slug),
      iconUrl: c.iconUrl?.trim() || null,
    }));
