import { describe, expect, test } from 'vitest';

import {
  cityFromTimeZone,
  formatHour,
  formatNowInZone,
  formatTime,
  formatWeekday
} from './datetime';

describe('datetime formatting', () => {
  test('should render the local hour', () => {
    expect(formatHour('2026-07-01T21:30')).toBe('9 PM');
    expect(formatHour('2026-07-01T00:00')).toBe('12 AM');
  });

  test('should render the hour and minute', () => {
    expect(formatTime('2026-07-01T21:30')).toBe('9:30 PM');
  });

  test('should respect the 24-hour preference', () => {
    expect(formatHour('2026-07-01T21:30', false)).toBe('21');
    expect(formatHour('2026-07-01T00:00', false)).toBe('00');
    expect(formatTime('2026-07-01T21:30', false)).toBe('21:30');
    expect(formatTime('2026-07-01T09:05', false)).toBe('09:05');
  });

  test('should render the short weekday from a date-only string', () => {
    expect(formatWeekday('2026-07-01')).toBe('Wed');
  });

  test('should not shift across day boundaries', () => {
    expect(formatWeekday('2026-07-01T23:30')).toBe('Wed');
  });

  test('should return a localized time for a valid zone', () => {
    expect(formatNowInZone('Asia/Tokyo')).toMatch(/^\d{1,2}:\d{2}\s?(AM|PM)$/);
  });

  test('should derive a readable city from an IANA zone', () => {
    expect(cityFromTimeZone('America/New_York')).toBe('New York');
    expect(cityFromTimeZone('Asia/Bangkok')).toBe('Bangkok');
    expect(cityFromTimeZone('Europe/Isle_of_Man')).toBe('Isle of Man');
    expect(cityFromTimeZone('UTC')).toBe('UTC');
  });
});
