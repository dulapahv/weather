import { describe, expect, it } from 'vitest';

import {
  cityFromTimeZone,
  formatHour,
  formatNowInZone,
  formatTime,
  formatWeekday
} from './datetime';

describe('datetime formatting', () => {
  it('should render the local hour', () => {
    expect(formatHour('2026-07-01T21:30')).toBe('9 PM');
    expect(formatHour('2026-07-01T00:00')).toBe('12 AM');
  });

  it('should render the hour and minute', () => {
    expect(formatTime('2026-07-01T21:30')).toBe('9:30 PM');
  });

  it('should respect the 24-hour preference', () => {
    expect(formatHour('2026-07-01T21:30', false)).toBe('21');
    expect(formatHour('2026-07-01T00:00', false)).toBe('00');
    expect(formatTime('2026-07-01T21:30', false)).toBe('21:30');
    expect(formatTime('2026-07-01T09:05', false)).toBe('09:05');
  });

  it('should render the short weekday from a date-only string', () => {
    expect(formatWeekday('2026-07-01')).toBe('Wed');
  });

  it('should not shift across day boundaries', () => {
    expect(formatWeekday('2026-07-01T23:30')).toBe('Wed');
  });

  it('should return a localized time for a valid zone', () => {
    expect(formatNowInZone('Asia/Tokyo')).toMatch(/^\d{1,2}:\d{2}\s?(AM|PM)$/);
  });

  it('should format a provided timestamp in the zone', () => {
    const at = Date.UTC(2026, 6, 7, 12, 0);
    expect(formatNowInZone('Asia/Tokyo', true, at)).toBe('9:00 PM');
    expect(formatNowInZone('UTC', false, at)).toBe('12:00');
  });

  it('should derive a readable city from an IANA zone', () => {
    expect(cityFromTimeZone('America/New_York')).toBe('New York');
    expect(cityFromTimeZone('Asia/Bangkok')).toBe('Bangkok');
    expect(cityFromTimeZone('Europe/Isle_of_Man')).toBe('Isle of Man');
    expect(cityFromTimeZone('UTC')).toBe('UTC');
  });
});
