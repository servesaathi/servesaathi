import type { ProviderProfile } from '@/api';

// Pure formatting + mapping for provider data — kept free of theme/asset
// imports so it can be unit-tested (see __tests__/providerMapping.test.ts).
// data.ts re-exports everything here.

/** Groups digits the way the Figma copy does — "25000" -> "25,000". */
const groupThousands = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** Indian digit grouping — 150000 -> "1,50,000". */
const groupIndian = (n: number) => {
  const digits = String(Math.round(n));
  if (digits.length <= 3) return digits;
  return `${digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${digits.slice(-3)}`;
};

/** "provider 3" — the backend has no display-name field beyond legalName, so fall back to first/last, then a generic label. */
export const getProviderName = (p: Pick<ProviderProfile, 'legalName' | 'firstName' | 'lastName'>): string =>
  p.legalName?.trim() || [p.firstName, p.lastName].filter(Boolean).join(' ').trim() || 'Provider';

/** Lowest service price across what the provider offers, e.g. "From ₹800" (or "On request" when nothing is priced). */
export const getProviderPrice = (p: Pick<ProviderProfile, 'servicesProvided'>): string => {
  const prices = p.servicesProvided.map((s) => s.effectivePrice).filter((n) => n > 0);
  return prices.length ? `From ${formatRupees(Math.min(...prices))}` : 'On request';
};

/** 800 -> "₹800", 150000 -> "₹1,50,000" */
export const formatRupees = (n: number) => `₹${groupIndian(n)}`;

/** 27 -> "27+ yrs" */
export const formatExperience = (years: number | null): string => (years ? `${years}+ yrs` : '-');

/** 25000 -> "25,000+" */
export const formatVisits = (count: number | null): string => (count ? `${groupThousands(count)}+` : '-');

// What the list / comparison / booking screens render. Built from the live
// provider profile (GET /services/providers/{id}/profile) — see toOrganization.
export interface Organization {
  /** String form of the backend provider id — route params carry it as `orgId`. */
  id: string;
  name: string;
  city: string;
  /** null until the provider has at least one review. */
  rating: number | null;
  ratingCount: number;
  featured?: boolean;
  /** "40+ yrs" */
  experience: string;
  /** One-line description — the provider's bio. */
  mission: string;
  /** Key facts. */
  impact: string[];
  programs: string[];
  services: string[];
  /** "From ₹800" */
  price: string;
}

export const toOrganization = (p: ProviderProfile): Organization => ({
  id: String(p.id),
  name: getProviderName(p),
  city: p.city,
  rating: p.totalReviews > 0 ? p.averageRating : null,
  ratingCount: p.totalReviews,
  experience: formatExperience(p.yearsOfExperience),
  mission: p.bio ?? '-',
  impact: p.keyFacts,
  programs: p.programs.map((x) => x.name),
  services: p.servicesProvided.map((s) => s.serviceName),
  price: getProviderPrice(p),
});

/** Stand-in shown by screens that need an Organization before the profile request resolves. */
export const placeholderOrganization = (id: string): Organization => ({
  id,
  name: 'Provider',
  city: '',
  rating: null,
  ratingCount: 0,
  experience: '-',
  mission: '-',
  impact: [],
  programs: [],
  services: [],
  price: 'On request',
});
