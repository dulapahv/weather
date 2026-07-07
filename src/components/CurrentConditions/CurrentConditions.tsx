import { cityFromTimeZone } from '@/lib/datetime';
import type { WeatherResponse } from '@/lib/schemas/weather';
import { formatTemperature } from '@/lib/units';
import { resolveCondition } from '@/lib/weather-codes';
import { WeatherIcon } from '@/components/WeatherIcon/WeatherIcon';

import styles from './CurrentConditions.module.scss';
import { ShareButton } from './ShareButton/ShareButton';

interface Props {
  weather: WeatherResponse;
  locationLabel: string;
  sourceNote?: string;
  shareEnabled: boolean;
}

export const CurrentConditions = ({ weather, locationLabel, sourceNote, shareEnabled }: Props) => {
  const { current, daily } = weather;
  const condition = resolveCondition(current.weatherCode);
  const today = daily[0];
  // Prefer a user-supplied label for the location, but fall back to the city name derived from
  // the timezone.
  const place = locationLabel || cityFromTimeZone(weather.location.timezone);

  return (
    <section className={styles.card} aria-label={`Current weather for ${place}`}>
      <header className={styles.head}>
        <div className={styles.headText}>
          <h2 className={styles.place}>{place}</h2>
          {sourceNote ? <p className={styles.source}>{sourceNote}</p> : null}
        </div>
        {shareEnabled ? (
          <ShareButton
            name={place}
            latitude={weather.location.latitude}
            longitude={weather.location.longitude}
          />
        ) : null}
      </header>

      <div className={styles.hero}>
        <WeatherIcon
          icon={condition.icon}
          description={condition.description}
          size={104}
          className={styles.icon}
          priority
        />

        <p className={styles.temp}>{formatTemperature(current.temperature)}</p>
        <div className={styles.meta}>
          <p className={styles.desc}>{condition.description}</p>
          <p className={styles.feels}>
            Feels like {formatTemperature(current.apparentTemperature)}
          </p>
          {today ? (
            <p className={styles.range}>
              H: {formatTemperature(today.temperatureMax ?? current.temperature)} L:{' '}
              {formatTemperature(today.temperatureMin ?? current.temperature)}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
};
