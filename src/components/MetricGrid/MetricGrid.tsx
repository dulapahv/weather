import type { Icon } from '@phosphor-icons/react';
import {
  DropIcon,
  EyeIcon,
  GaugeIcon,
  SquaresFourIcon,
  SunHorizonIcon,
  SunIcon,
  UmbrellaIcon,
  WindIcon
} from '@phosphor-icons/react/dist/ssr';

import { formatTime } from '@/lib/datetime';
import type { WeatherResponse } from '@/lib/schemas/weather';
import {
  formatDistance,
  formatPercent,
  formatPressure,
  formatUvIndex,
  formatWind
} from '@/lib/units';
import type { Units } from '@/store/preferences';

import styles from './MetricGrid.module.scss';

interface Props {
  weather: WeatherResponse;
  units: Units;
}

export const MetricGrid = ({ weather, units }: Props) => {
  const { current, daily } = weather;
  const today = daily[0];
  const hour12 = units.clock !== '24h';

  const metrics: Array<{ label: string; value: string; icon: Icon }> = [
    {
      label: 'Wind',
      value: formatWind(current.windSpeed, units.windSpeed),
      icon: WindIcon
    },
    { label: 'Humidity', value: formatPercent(current.humidity), icon: DropIcon },
    {
      label: 'Visibility',
      value: formatDistance(current.visibility, units.distance),
      icon: EyeIcon
    },
    {
      label: 'Pressure',
      value: formatPressure(current.pressure, units.pressure),
      icon: GaugeIcon
    },
    { label: 'UV index', value: formatUvIndex(current.uvIndex), icon: SunIcon },
    {
      label: 'Precipitation',
      value: `${current.precipitation} ${weather.units.precipitation}`,
      icon: UmbrellaIcon
    }
  ];

  if (today) {
    metrics.push({
      label: 'Sunrise',
      value: formatTime(today.sunrise, hour12),
      icon: SunHorizonIcon
    });
    metrics.push({
      label: 'Sunset',
      value: formatTime(today.sunset, hour12),
      icon: SunHorizonIcon
    });
  }

  return (
    <section className={styles.card} aria-label="Weather details">
      <h3 className={styles.heading}>
        <SquaresFourIcon weight="bold" aria-hidden />
        Details
      </h3>

      <dl className={styles.grid}>
        {metrics.map(({ label, value, icon: MetricIcon }) => (
          <div key={label} className={styles.metric}>
            <dt>
              <MetricIcon weight="bold" aria-hidden />
              {label}
            </dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
