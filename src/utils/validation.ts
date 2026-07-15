// Shared form-validation helpers.

/** Strip everything except digits (paste-safe input sanitizing). */
export const digitsOnly = (value: string): string => value.replace(/\D/g, '');

/**
 * Indian mobile number: exactly 10 digits, starting 6-9 (TRAI numbering plan).
 * Expects an already-sanitized digit string without country code.
 */
export const isValidIndianMobile = (value: string): boolean => /^[6-9]\d{9}$/.test(value);

export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

/** Indian PIN code: exactly 6 digits, cannot start with 0. */
export const isValidPinCode = (value: string): boolean => /^[1-9]\d{5}$/.test(value);

/** Person name: at least 2 characters, letters/spaces/'/- only. */
export const isValidName = (value: string): boolean =>
  /^[A-Za-z][A-Za-z\s.'-]{1,}$/.test(value.trim());

export const MIN_PASSWORD_LENGTH = 8;

export const isValidPassword = (value: string): boolean =>
  value.length >= MIN_PASSWORD_LENGTH;

/** Calendar-aware date-of-birth check; year must be 1900..current year. */
export const isValidDateOfBirth = (day: string, month: string, year: string): boolean => {
  if (!/^\d{1,2}$/.test(day) || !/^\d{1,2}$/.test(month) || !/^\d{4}$/.test(year)) return false;
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  const currentYear = new Date().getFullYear();
  if (y < 1900 || y > currentYear) return false;
  if (m < 1 || m > 12) return false;
  const daysInMonth = new Date(y, m, 0).getDate();
  if (d < 1 || d > daysInMonth) return false;
  // Not in the future
  const dob = new Date(y, m - 1, d);
  return dob.getTime() <= Date.now();
};
