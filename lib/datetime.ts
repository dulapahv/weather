const LOCALE = 'en-US';

function wallClock(iso: string): Date {
  let s = iso;
  if (s.length === 10) s += 'T00:00:00';
  else if (s.length === 16) s += ':00';
  return new Date(`${s}Z`);
}

export function formatHour(iso: string, hour12 = true): string {
  return new Intl.DateTimeFormat(LOCALE, {
    hour: hour12 ? 'numeric' : '2-digit',
    hour12,
    timeZone: 'UTC'
  }).format(wallClock(iso));
}

export function formatTime(iso: string, hour12 = true): string {
  return new Intl.DateTimeFormat(LOCALE, {
    hour: hour12 ? 'numeric' : '2-digit',
    minute: '2-digit',
    hour12,
    timeZone: 'UTC'
  }).format(wallClock(iso));
}

export function formatWeekday(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: 'short',
    timeZone: 'UTC'
  }).format(wallClock(iso));
}

export function formatNowInZone(timeZone: string, hour12 = true): string {
  return new Intl.DateTimeFormat(LOCALE, {
    hour: hour12 ? 'numeric' : '2-digit',
    minute: '2-digit',
    hour12,
    timeZone
  }).format(new Date());
}

export function cityFromTimeZone(timeZone: string): string {
  const segment = timeZone.split('/').at(-1) ?? timeZone;
  return segment.replace(/_/g, ' ');
}
