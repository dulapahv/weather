'use client';

import { useEffect, useRef } from 'react';

import { ClockIcon } from '@phosphor-icons/react/dist/ssr';

import { formatHour } from '@/lib/datetime';
import type { HourlyEntry, WeatherResponse } from '@/lib/schemas/weather';
import { formatPercent, formatTemperature } from '@/lib/units';
import { resolveCondition } from '@/lib/weather-codes';
import type { Units } from '@/store/preferences';
import { WeatherIcon } from '@/components/WeatherIcon/WeatherIcon';

import styles from './HourlyForecast.module.scss';

interface Props {
  weather: WeatherResponse;
  units: Units;
}

export const upcomingHours = (
  hours: HourlyEntry[],
  currentTime: string,
  count = 24
): HourlyEntry[] => {
  const cutoff = currentTime.slice(0, 13); // YYYY-MM-DDTHH
  const start = hours.findIndex(h => h.time.slice(0, 13) >= cutoff);
  const begin = start === -1 ? 0 : start;

  return hours.slice(begin, begin + count);
};

export const HourlyForecast = ({ weather, units }: Props) => {
  const hour12 = units.clock !== '24h';
  const nowKey = weather.current.time.slice(0, 13);
  const hours = upcomingHours(weather.hourly, weather.current.time);

  const trackRef = useRef<HTMLUListElement>(null);
  const nowRef = useRef<HTMLLIElement>(null);
  const { latitude, longitude } = weather.location;

  // Re-anchor the strip to "Now" when the location changes or the hour rolls over.
  useEffect(() => {
    const track = trackRef.current;
    const cell = nowRef.current;
    if (!track || !cell) return;
    track.scrollLeft += cell.getBoundingClientRect().left - track.getBoundingClientRect().left;
  }, [latitude, longitude, nowKey]);

  if (hours.length === 0) return null;

  return (
    <section className={styles.card} aria-label="Hourly forecast">
      <h3 className={styles.heading}>
        <ClockIcon weight="bold" aria-hidden />
        Hourly
      </h3>

      <ul className={styles.track} ref={trackRef} tabIndex={0} aria-label="Hourly forecast">
        {hours.map(h => {
          const condition = resolveCondition(h.weatherCode ?? 0);
          const isNow = h.time.slice(0, 13) === nowKey;
          return (
            <li
              key={h.time}
              ref={isNow ? nowRef : undefined}
              className={isNow ? `${styles.hour} ${styles.now}` : styles.hour}
            >
              <span className={styles.time}>{isNow ? 'Now' : formatHour(h.time, hour12)}</span>
              <WeatherIcon icon={condition.icon} description={condition.description} size={40} />
              <span className={styles.temp}>
                {h.temperature != null ? formatTemperature(h.temperature) : '—'}
              </span>
              <span className={styles.pop}>
                {h.precipitationProbability != null && h.precipitationProbability > 0
                  ? formatPercent(h.precipitationProbability)
                  : ''}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
