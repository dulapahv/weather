// Maps WMO weather_code to a human description
// https://github.com/open-meteo/open-meteo/issues/789#issuecomment-2206144530
export interface Condition {
  description: string;
  icon: string;
}

const WMO: Record<number, Condition> = {
  0: { description: 'Clear sky', icon: 'clear' },
  1: { description: 'Mainly clear', icon: 'mostly-clear' },
  2: { description: 'Partly cloudy', icon: 'partly-cloudy' },
  3: { description: 'Overcast', icon: 'overcast' },
  45: { description: 'Fog', icon: 'fog' },
  48: { description: 'Rime fog', icon: 'rime-fog' },
  51: { description: 'Light drizzle', icon: 'light-drizzle' },
  53: { description: 'Moderate drizzle', icon: 'moderate-drizzle' },
  55: { description: 'Dense drizzle', icon: 'dense-drizzle' },
  56: { description: 'Light freezing drizzle', icon: 'light-freezing-drizzle' },
  57: { description: 'Dense freezing drizzle', icon: 'dense-freezing-drizzle' },
  61: { description: 'Slight rain', icon: 'light-rain' },
  63: { description: 'Moderate rain', icon: 'moderate-rain' },
  65: { description: 'Heavy rain', icon: 'heavy-rain' },
  66: { description: 'Light freezing rain', icon: 'light-freezing-rain' },
  67: { description: 'Heavy freezing rain', icon: 'heavy-freezing-rain' },
  71: { description: 'Slight snow', icon: 'slight-snowfall' },
  73: { description: 'Moderate snow', icon: 'moderate-snowfall' },
  75: { description: 'Heavy snow', icon: 'heavy-snowfall' },
  77: { description: 'Snow grains', icon: 'snowflake' },
  80: { description: 'Slight rain showers', icon: 'light-rain' },
  81: { description: 'Moderate rain showers', icon: 'moderate-rain' },
  82: { description: 'Violent rain showers', icon: 'heavy-rain' },
  85: { description: 'Slight snow showers', icon: 'slight-snowfall' },
  86: { description: 'Heavy snow showers', icon: 'heavy-snowfall' },
  95: { description: 'Thunderstorm', icon: 'thunderstorm' },
  96: { description: 'Thunderstorm with hail', icon: 'thunderstorm-with-hail' },
  99: { description: 'Thunderstorm with heavy hail', icon: 'thunderstorm-with-hail' }
};

const FALLBACK: Condition = { description: 'Unknown', icon: 'overcast' };

export function resolveCondition(code: number): Condition {
  return WMO[code] ?? FALLBACK;
}

export function iconSrc(icon: string): string {
  return `/icons/${icon}@4x.png`;
}
