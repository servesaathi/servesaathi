import type { ProviderAvailability } from '@/api';

// Pure formatting for GET /providers/{id}/availability — see
// __tests__/availability.test.ts.

export interface AvailabilityRow {
  day: string;
  /** "9 AM - 5 PM", several slots joined with ", ", or "Not available". */
  hours: string;
  off: boolean;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
/** Display order: Monday first. Values are the backend's dayOfWeek (0 = Sunday). */
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** "09:00" -> "9 AM", "13:30" -> "1:30 PM", "00:00" -> "12 AM". Unparseable input is returned as-is. */
export const formatSlotTime = (time: string): string => {
  const match = /^(\d{1,2}):(\d{2})/.exec(time);
  if (!match) return time;
  const hours24 = Number(match[1]) % 24;
  const minutes = match[2];
  const suffix = hours24 < 12 ? 'AM' : 'PM';
  const hours12 = hours24 % 12 || 12;
  return minutes === '00' ? `${hours12} ${suffix}` : `${hours12}:${minutes} ${suffix}`;
};

/**
 * Monday→Sunday, one row per day. Returns null when the provider hasn't
 * published a single active slot, so the screen can show an empty state
 * instead of seven "Not available" rows.
 */
export const toWeeklyAvailability = (slots: ProviderAvailability[]): AvailabilityRow[] | null => {
  const active = slots.filter((s) => s.isActive);
  if (active.length === 0) return null;

  return WEEK_ORDER.map((dayOfWeek) => {
    const daySlots = active
      .filter((s) => s.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return {
      day: DAY_NAMES[dayOfWeek],
      hours: daySlots.length
        ? daySlots.map((s) => `${formatSlotTime(s.startTime)} - ${formatSlotTime(s.endTime)}`).join(', ')
        : 'Not available',
      off: daySlots.length === 0,
    };
  });
};
