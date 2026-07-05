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

export const resolveCondition = (code: number): Condition => {
  return WMO[code] ?? FALLBACK;
};

export const iconSrc = (icon: string): string => {
  return `/icons/${icon}@4x.png`;
};

export type ConditionFamily =
  'clear' | 'partly-cloudy' | 'overcast' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunder';

const FAMILY_BY_CODE: Record<number, ConditionFamily> = {
  0: 'clear',
  1: 'clear',
  2: 'partly-cloudy',
  3: 'overcast',
  45: 'fog',
  48: 'fog',
  51: 'drizzle',
  53: 'drizzle',
  55: 'drizzle',
  56: 'drizzle',
  57: 'drizzle',
  61: 'rain',
  63: 'rain',
  65: 'rain',
  66: 'rain',
  67: 'rain',
  80: 'rain',
  81: 'rain',
  82: 'rain',
  71: 'snow',
  73: 'snow',
  75: 'snow',
  77: 'snow',
  85: 'snow',
  86: 'snow',
  95: 'thunder',
  96: 'thunder',
  99: 'thunder'
};

export const conditionFamily = (code: number): ConditionFamily => {
  return FAMILY_BY_CODE[code] ?? 'overcast';
};

const OG_GRADIENTS: Record<ConditionFamily, { day: string; night: string }> = {
  clear: {
    day: 'linear-gradient(135deg, #2f6fb0 0%, #12233b 68%, #0a0a0a 100%)',
    night: 'linear-gradient(135deg, #17233d 0%, #05070d 70%, #000000 100%)'
  },
  'partly-cloudy': {
    day: 'linear-gradient(135deg, #4a6d90 0%, #141f2e 68%, #0a0a0a 100%)',
    night: 'linear-gradient(135deg, #1a2532 0%, #06080d 70%, #000000 100%)'
  },
  overcast: {
    day: 'linear-gradient(135deg, #545c6b 0%, #171a20 68%, #0a0a0a 100%)',
    night: 'linear-gradient(135deg, #20242c 0%, #070809 70%, #000000 100%)'
  },
  fog: {
    day: 'linear-gradient(135deg, #5c626b 0%, #191b1f 68%, #0a0a0a 100%)',
    night: 'linear-gradient(135deg, #23262b 0%, #08090b 70%, #000000 100%)'
  },
  drizzle: {
    day: 'linear-gradient(135deg, #3f699e 0%, #131f2f 68%, #0a0a0a 100%)',
    night: 'linear-gradient(135deg, #182231 0%, #06080d 70%, #000000 100%)'
  },
  rain: {
    day: 'linear-gradient(135deg, #33518f 0%, #111a2d 68%, #0a0a0a 100%)',
    night: 'linear-gradient(135deg, #141d33 0%, #05070d 70%, #000000 100%)'
  },
  snow: {
    day: 'linear-gradient(135deg, #536d99 0%, #16202f 68%, #0a0a0a 100%)',
    night: 'linear-gradient(135deg, #1b2433 0%, #07090d 70%, #000000 100%)'
  },
  thunder: {
    day: 'linear-gradient(135deg, #57459b 0%, #171130 68%, #0a0a0a 100%)',
    night: 'linear-gradient(135deg, #1d1636 0%, #08060d 70%, #000000 100%)'
  }
};

export const ogGradient = (family: ConditionFamily, isDay: boolean): string => {
  const gradient = OG_GRADIENTS[family];
  return isDay ? gradient.day : gradient.night;
};
