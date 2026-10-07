import { describe, expect, it } from '@jest/globals';
import type { ProviderAvailability } from '@/api';
import { formatSlotTime, toWeeklyAvailability } from '../availability';

let nextId = 1;
const slot = (dayOfWeek: number, startTime: string, endTime: string, isActive = true): ProviderAvailability => ({
  id: nextId++,
  providerId: 1,
  dayOfWeek,
  startTime,
  endTime,
  slotDurationMinutes: 30,
  isActive,
});

describe('formatSlotTime', () => {
  it.each([
    ['09:00', '9 AM'],
    ['17:00', '5 PM'],
    ['13:30', '1:30 PM'],
    ['00:00', '12 AM'],
    ['12:00', '12 PM'],
    ['24:00', '12 AM'],
    ['09:00:00', '9 AM'],
  ])('%s -> %s', (input, expected) => {
    expect(formatSlotTime(input)).toBe(expected);
  });

  it('passes unparseable values through', () => {
    expect(formatSlotTime('morning')).toBe('morning');
  });
});

describe('toWeeklyAvailability', () => {
  it('lists Monday→Sunday, marking days without a slot as not available', () => {
    // Shaped like the live seed for provider 1: Mon–Sat 09:00–17:00, nothing on Sunday.
    const rows = toWeeklyAvailability([1, 2, 3, 4, 5, 6].map((d) => slot(d, '09:00', '17:00')));
    expect(rows).toEqual([
      { day: 'Monday', hours: '9 AM - 5 PM', off: false },
      { day: 'Tuesday', hours: '9 AM - 5 PM', off: false },
      { day: 'Wednesday', hours: '9 AM - 5 PM', off: false },
      { day: 'Thursday', hours: '9 AM - 5 PM', off: false },
      { day: 'Friday', hours: '9 AM - 5 PM', off: false },
      { day: 'Saturday', hours: '9 AM - 5 PM', off: false },
      { day: 'Sunday', hours: 'Not available', off: true },
    ]);
  });

  it('joins several slots on one day in start-time order', () => {
    const rows = toWeeklyAvailability([slot(0, '14:00', '18:30'), slot(0, '09:00', '12:00')]);
    expect(rows?.find((r) => r.day === 'Sunday')).toEqual({
      day: 'Sunday',
      hours: '9 AM - 12 PM, 2 PM - 6:30 PM',
      off: false,
    });
  });

  it('ignores inactive slots', () => {
    const rows = toWeeklyAvailability([slot(1, '09:00', '17:00'), slot(2, '09:00', '17:00', false)]);
    expect(rows?.[0]).toEqual({ day: 'Monday', hours: '9 AM - 5 PM', off: false });
    expect(rows?.[1]).toEqual({ day: 'Tuesday', hours: 'Not available', off: true });
  });

  it('returns null when nothing active is published', () => {
    expect(toWeeklyAvailability([])).toBeNull();
    expect(toWeeklyAvailability([slot(1, '09:00', '17:00', false)])).toBeNull();
  });
});
