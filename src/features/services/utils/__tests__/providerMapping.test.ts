import { describe, test, expect } from '@jest/globals';
import type { ProviderProfile } from '@/api';
import {
  formatExperience,
  formatRupees,
  formatVisits,
  getProviderName,
  getProviderPrice,
  placeholderOrganization,
  toOrganization,
} from '../providerMapping';

const service = (effectivePrice: number) =>
  ({ id: 1, serviceId: 1, serviceName: 'Memory Care Support', effectivePrice }) as ProviderProfile['servicesProvided'][number];

// Shaped like the live GET /services/providers/1/profile response (2026-09-25).
const profile: ProviderProfile = {
  id: 1,
  legalName: 'provider 3',
  city: 'Bengaluru',
  registeredAddress: null,
  pincodes: ['560001'],
  averageRating: 4.5,
  totalReviews: 12,
  yearsOfExperience: 40,
  experienceCount: 9,
  isAvailable: true,
  bedsAvailable: false,
  bio: 'Dummy seeded provider for testing.',
  aboutText: 'About text',
  keyFacts: ['Recognized by UN-DPI'],
  websiteUrl: null,
  categories: [{ id: 3, name: 'Assisted Living' }],
  programs: [{ id: 5, name: '24/7 Phone support' }],
  servicesProvided: [service(2000), service(800)],
  recognitions: [],
};

describe('formatRupees', () => {
  test('uses Indian digit grouping', () => {
    expect(formatRupees(800)).toBe('₹800');
    expect(formatRupees(20000)).toBe('₹20,000');
    expect(formatRupees(150000)).toBe('₹1,50,000');
    expect(formatRupees(12345678)).toBe('₹1,23,45,678');
  });
});

describe('formatExperience / formatVisits', () => {
  test('format counts the way the Figma copy does', () => {
    expect(formatExperience(27)).toBe('27+ yrs');
    expect(formatVisits(25000)).toBe('25,000+');
  });

  test('show a dash when the backend has no value', () => {
    expect(formatExperience(null)).toBe('-');
    expect(formatExperience(0)).toBe('-');
    expect(formatVisits(null)).toBe('-');
  });
});

describe('getProviderName', () => {
  test('prefers legalName', () => {
    expect(getProviderName({ legalName: ' Acme Care ', firstName: 'A', lastName: 'B' })).toBe('Acme Care');
  });

  test('falls back to first + last name, then a generic label', () => {
    expect(getProviderName({ legalName: null, firstName: 'Asha', lastName: 'Rao' })).toBe('Asha Rao');
    expect(getProviderName({ legalName: null })).toBe('Provider');
  });
});

describe('getProviderPrice', () => {
  test('shows the lowest service price', () => {
    expect(getProviderPrice({ servicesProvided: [service(2000), service(800)] })).toBe('From ₹800');
  });

  test('ignores unpriced services and reports "On request" when none are priced', () => {
    expect(getProviderPrice({ servicesProvided: [service(0), service(1500)] })).toBe('From ₹1,500');
    expect(getProviderPrice({ servicesProvided: [] })).toBe('On request');
  });
});

describe('toOrganization', () => {
  test('maps a live profile onto the list/comparison shape', () => {
    expect(toOrganization(profile)).toEqual({
      id: '1',
      name: 'provider 3',
      city: 'Bengaluru',
      rating: 4.5,
      ratingCount: 12,
      experience: '40+ yrs',
      mission: 'Dummy seeded provider for testing.',
      impact: ['Recognized by UN-DPI'],
      programs: ['24/7 Phone support'],
      services: ['Memory Care Support', 'Memory Care Support'],
      price: 'From ₹800',
    });
  });

  test('a provider with no reviews has a null rating, not 0', () => {
    // The backend reports averageRating 0 / totalReviews 0 after the last review is deleted.
    const org = toOrganization({ ...profile, averageRating: 0, totalReviews: 0, bio: null });
    expect(org.rating).toBeNull();
    expect(org.ratingCount).toBe(0);
    expect(org.mission).toBe('-');
  });
});

describe('placeholderOrganization', () => {
  test('keeps the requested id so downstream navigation still works', () => {
    expect(placeholderOrganization('7').id).toBe('7');
  });
});
