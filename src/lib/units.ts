export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'ms' | 'mph' | 'kn';
export type DistanceUnit = 'km' | 'mi';
export type PressureUnit = 'hpa' | 'inhg' | 'mmhg';
export type PrecipitationUnit = 'mm' | 'inch';
export type ClockFormat = '12h' | '24h';

const WIND_LABEL: Record<WindSpeedUnit, string> = {
  kmh: 'km/h',
  ms: 'm/s',
  mph: 'mph',
  kn: 'kn'
};
const PRESSURE_LABEL: Record<PressureUnit, string> = {
  hpa: 'hPa',
  inhg: 'inHg',
  mmhg: 'mmHg'
};
const DISTANCE_LABEL: Record<DistanceUnit, string> = { km: 'km', mi: 'mi' };

export const convertPressure = (hpa: number, unit: PressureUnit): number => {
  switch (unit) {
    case 'inhg':
      return hpa * 0.0295299830714;
    case 'mmhg':
      return hpa * 0.750061683;
    default:
      return hpa;
  }
};

export const convertDistance = (meters: number, unit: DistanceUnit): number => {
  return unit === 'mi' ? meters / 1609.344 : meters / 1000;
};

export const formatTemperature = (value: number): string => {
  const rounded = Math.round(value);
  // Math.round(-0.4) is -0; normalize so we never render "-0°".
  return `${rounded === 0 ? 0 : rounded}°`;
};

// Group thousands with commas (1013 -> "1,013").
export const formatNumber = (value: number, fractionDigits = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(value);
};

const COMPASS_POINTS = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'E',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSW',
  'SW',
  'WSW',
  'W',
  'WNW',
  'NW',
  'NNW'
] as const;

export const compassPoint = (degrees: number): string => {
  const normalized = ((degrees % 360) + 360) % 360;
  return COMPASS_POINTS[Math.round(normalized / 22.5) % 16] ?? 'N';
};

export const formatWind = (value: number, unit: WindSpeedUnit): string => {
  return `${formatNumber(value)} ${WIND_LABEL[unit]}`;
};

export const formatPressure = (hpa: number, unit: PressureUnit): string => {
  const value = convertPressure(hpa, unit);
  return `${formatNumber(value, unit === 'inhg' ? 2 : 0)} ${PRESSURE_LABEL[unit]}`;
};

export const formatDistance = (meters: number, unit: DistanceUnit): string => {
  const value = convertDistance(meters, unit);
  return `${formatNumber(value, unit === 'mi' ? 1 : 0)} ${DISTANCE_LABEL[unit]}`;
};

export const formatPercent = (value: number): string => {
  return `${Math.round(value)}%`;
};

// UV index with its WHO exposure category, so a value like 0 shows as "0 · Low"
export const formatUvIndex = (value: number): string => {
  const v = Math.round(value);
  const category =
    v <= 2 ? 'Low' : v <= 5 ? 'Moderate' : v <= 7 ? 'High' : v <= 10 ? 'Very high' : 'Extreme';
  return `${v} · ${category}`;
};
