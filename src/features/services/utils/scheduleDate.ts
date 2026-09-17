// Shared date helpers for the request-scheduling flow — RequestSetupScreen's
// calendar/quick-pick strip, and RequestDetailsScreen's read-back of what
// was picked there (see requestValues in navigation/types.ts).

export const WEEKDAY_ABBR = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
export const WEEKDAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const startOfDay = (d: Date): Date => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const addDays = (d: Date, n: number): Date => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** 5 consecutive days starting at `start`, for the quick-pick strip. */
export const buildWeekStrip = (start: Date): Date[] => Array.from({ length: 5 }, (_, i) => addDays(start, i));

/** Every day of `month`'s calendar month, padded with `null` for the leading blank cells. */
export const buildMonthGrid = (month: Date): Array<Date | null> => {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const leadingBlanks = first.getDay();
  return [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ];
};

/** Date -> "2026-04-15", the local calendar date (not UTC — avoids shifting a day near midnight). */
export const toDateISO = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/** "2026-04-15" -> Date at local midnight. */
export const parseDateISO = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

/** Date -> "Wednesday, 15 April" */
export const formatWeekdayDate = (d: Date): string =>
  `${WEEKDAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
