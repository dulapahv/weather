import { CalendarDotsIcon } from '@phosphor-icons/react/dist/ssr';

import { formatWeekday } from '@/lib/datetime';
import type { WeatherResponse } from '@/lib/schemas/weather';
import { formatPercent, formatTemperature } from '@/lib/units';
import { resolveCondition } from '@/lib/weather-codes';
import { WeatherIcon } from '@/components/WeatherIcon/WeatherIcon';

import styles from './TenDayForecast.module.scss';

interface Props {
  weather: WeatherResponse;
}

export const TenDayForecast = ({ weather }: Props) => {
  const days = weather.daily;
  if (days.length === 0) return null;

  const lows = days.map(d => d.temperatureMin).filter((v): v is number => v != null);
  const highs = days.map(d => d.temperatureMax).filter((v): v is number => v != null);

  const scaleMin = lows.length ? Math.min(...lows) : 0;
  const scaleMax = highs.length ? Math.max(...highs) : 1;
  const span = scaleMax - scaleMin || 1;

  // Where the current temperature falls on today's range, as a 0–100% position.
  const now = weather.current.temperature;
  const nowPct = Math.min(100, Math.max(0, ((now - scaleMin) / span) * 100));

  return (
    <section className={styles.card} aria-label="10-day forecast">
      <h3 className={styles.heading}>
        <CalendarDotsIcon weight="bold" aria-hidden />
        10-day forecast
      </h3>

      <ul className={styles.list}>
        {days.map((d, i) => {
          const condition = resolveCondition(d.weatherCode ?? 0);
          const lo = d.temperatureMin;
          const hi = d.temperatureMax;
          const left = lo != null ? ((lo - scaleMin) / span) * 100 : 0;
          const right = hi != null ? ((scaleMax - hi) / span) * 100 : 0;
          return (
            <li key={d.date} className={styles.row}>
              <span className={styles.day}>{i === 0 ? 'Today' : formatWeekday(d.date)}</span>
              <WeatherIcon
                icon={condition.icon}
                description={condition.description}
                size={32}
                className={styles.icon}
              />
              <span className={styles.pop}>
                {d.precipitationProbabilityMax != null && d.precipitationProbabilityMax > 0
                  ? formatPercent(d.precipitationProbabilityMax)
                  : ''}
              </span>
              <span className={styles.low}>{lo != null ? formatTemperature(lo) : '—'}</span>
              <span className={styles.bar} aria-hidden>
                <span className={styles.fill} style={{ left: `${left}%`, right: `${right}%` }} />
                {i === 0 ? (
                  <span
                    className={styles.marker}
                    style={{ left: `${nowPct}%` }}
                    title={`Now: ${formatTemperature(now)}`}
                  />
                ) : null}
              </span>
              <span className={styles.high}>{hi != null ? formatTemperature(hi) : '—'}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
