import { describe, it, expect } from '@jest/globals';

import {
  digitsOnly,
  isValidIndianMobile,
  isValidEmail,
  isValidPinCode,
  isValidName,
  isValidPassword,
  isValidDateOfBirth,
} from '../validation';

describe('digitsOnly', () => {
  it('strips non-digit characters', () => {
    expect(digitsOnly('98-76 54(32)10')).toBe('9876543210');
    expect(digitsOnly('+919876543210')).toBe('919876543210');
    expect(digitsOnly('abc')).toBe('');
  });
});

describe('isValidIndianMobile', () => {
  it('accepts 10-digit numbers starting with 6-9', () => {
    expect(isValidIndianMobile('9876543210')).toBe(true);
    expect(isValidIndianMobile('6000000000')).toBe(true);
    expect(isValidIndianMobile('7123456789')).toBe(true);
    expect(isValidIndianMobile('8123456789')).toBe(true);
  });

  it('rejects numbers starting with 0-5', () => {
    expect(isValidIndianMobile('5876543210')).toBe(false);
    expect(isValidIndianMobile('0876543210')).toBe(false);
    expect(isValidIndianMobile('1234567890')).toBe(false);
  });

  it('rejects wrong lengths', () => {
    expect(isValidIndianMobile('987654321')).toBe(false); // 9 digits
    expect(isValidIndianMobile('98765432101')).toBe(false); // 11 digits
    expect(isValidIndianMobile('')).toBe(false);
  });

  it('rejects non-digit input', () => {
    expect(isValidIndianMobile('98765abc10')).toBe(false);
    expect(isValidIndianMobile('98765 4321')).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('accepts standard addresses', () => {
    expect(isValidEmail('kamalasharma@gmail.com')).toBe(true);
    expect(isValidEmail('a.b-c@example.co.in')).toBe(true);
  });

  it('rejects malformed addresses', () => {
    expect(isValidEmail('kamala@')).toBe(false);
    expect(isValidEmail('kamala@gmail')).toBe(false);
    expect(isValidEmail('@gmail.com')).toBe(false);
    expect(isValidEmail('kamala gmail.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidPinCode', () => {
  it('accepts 6-digit codes not starting with 0', () => {
    expect(isValidPinCode('110016')).toBe(true);
    expect(isValidPinCode('560001')).toBe(true);
  });

  it('rejects invalid codes', () => {
    expect(isValidPinCode('011016')).toBe(false); // leading zero
    expect(isValidPinCode('11001')).toBe(false); // 5 digits
    expect(isValidPinCode('1100167')).toBe(false); // 7 digits
    expect(isValidPinCode('11001a')).toBe(false);
  });
});

describe('isValidName', () => {
  it('accepts real names', () => {
    expect(isValidName('Kamala')).toBe(true);
    expect(isValidName('Suresh Sharma')).toBe(true);
    expect(isValidName("O'Brien")).toBe(true);
  });

  it('rejects too-short or non-alphabetic input', () => {
    expect(isValidName('K')).toBe(false);
    expect(isValidName('123')).toBe(false);
    expect(isValidName('')).toBe(false);
    expect(isValidName('  ')).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('enforces minimum length of 8', () => {
    expect(isValidPassword('12345678')).toBe(true);
    expect(isValidPassword('1234567')).toBe(false);
    expect(isValidPassword('')).toBe(false);
  });
});

describe('isValidDateOfBirth', () => {
  it('accepts valid past dates', () => {
    expect(isValidDateOfBirth('20', '02', '1960')).toBe(true);
    expect(isValidDateOfBirth('1', '1', '2000')).toBe(true);
    expect(isValidDateOfBirth('29', '02', '1960')).toBe(true); // leap year
  });

  it('rejects impossible dates', () => {
    expect(isValidDateOfBirth('31', '02', '1960')).toBe(false);
    expect(isValidDateOfBirth('29', '02', '1961')).toBe(false); // not a leap year
    expect(isValidDateOfBirth('00', '05', '1960')).toBe(false);
    expect(isValidDateOfBirth('15', '13', '1960')).toBe(false);
  });

  it('rejects out-of-range years and future dates', () => {
    expect(isValidDateOfBirth('15', '05', '1899')).toBe(false);
    expect(isValidDateOfBirth('15', '05', String(new Date().getFullYear() + 1))).toBe(false);
  });

  it('rejects incomplete input', () => {
    expect(isValidDateOfBirth('', '02', '1960')).toBe(false);
    expect(isValidDateOfBirth('20', '02', '60')).toBe(false); // 2-digit year
  });
});
