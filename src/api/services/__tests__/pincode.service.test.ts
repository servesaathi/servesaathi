import { describe, test, expect } from '@jest/globals';
import { toTitleCase, normalizePlaceList } from '../pincode.service';

describe('toTitleCase', () => {
  test('converts ALL-CAPS state names', () => {
    expect(toTitleCase('KARNATAKA')).toBe('Karnataka');
    expect(toTitleCase('TAMIL NADU')).toBe('Tamil Nadu');
    expect(toTitleCase('JAMMU & KASHMIR')).toBe('Jammu & Kashmir');
    expect(toTitleCase('ANDAMAN & NICOBAR ISLANDS')).toBe('Andaman & Nicobar Islands');
  });

  test('collapses the stray double spaces in the source data', () => {
    expect(toTitleCase('Lucknow  HQ')).toBe('Lucknow Hq');
    expect(toTitleCase('  DELHI ')).toBe('Delhi');
  });
});

describe('normalizePlaceList', () => {
  test('drops the literal NULL row and blank entries', () => {
    expect(normalizePlaceList(['KERALA', 'NULL', ' ', 'GOA'])).toEqual(['KERALA', 'GOA']);
  });

  test('trims and collapses whitespace', () => {
    expect(normalizePlaceList(['Ambala  HQ', ' Agra '])).toEqual(['Ambala HQ', 'Agra']);
  });

  test('handles non-array and mixed payloads', () => {
    expect(normalizePlaceList(undefined)).toEqual([]);
    expect(normalizePlaceList([42, null, 'Pune'])).toEqual(['Pune']);
  });
});
