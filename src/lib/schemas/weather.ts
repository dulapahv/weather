import { z } from 'zod';

export const temperatureUnitSchema = z.enum(['celsius', 'fahrenheit']);
export const windSpeedUnitSchema = z.enum(['kmh', 'ms', 'mph', 'kn']);
export const precipitationUnitSchema = z.enum(['mm', 'inch']);

export const weatherQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  temperatureUnit: temperatureUnitSchema.default('celsius'),
  windSpeedUnit: windSpeedUnitSchema.default('kmh'),
  precipitationUnit: precipitationUnitSchema.default('mm')
});
export type WeatherQuery = z.infer<typeof weatherQuerySchema>;

const numberSeries = z.array(z.number().nullable());
const unitMap = z.record(z.string(), z.string());

// https://open-meteo.com/en/docs#json_return_object
export const upstreamForecastSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  utc_offset_seconds: z.number(),
  timezone: z.string(),
  timezone_abbreviation: z.string(),
  elevation: z.number().optional(),
  current_units: unitMap,
  current: z.object({
    time: z.string(),
    interval: z.number().optional(),
    temperature_2m: z.number(),
    relative_humidity_2m: z.number(),
    apparent_temperature: z.number(),
    is_day: z.number(),
    precipitation: z.number(),
    weather_code: z.number(),
    wind_speed_10m: z.number(),
    wind_direction_10m: z.number(),
    surface_pressure: z.number(),
    visibility: z.number(),
    uv_index: z.number()
  }),
  hourly_units: unitMap,
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: numberSeries,
    apparent_temperature: numberSeries,
    weather_code: numberSeries,
    is_day: numberSeries,
    precipitation_probability: numberSeries
  }),
  daily_units: unitMap,
  daily: z.object({
    time: z.array(z.string()),
    weather_code: numberSeries,
    temperature_2m_max: numberSeries,
    temperature_2m_min: numberSeries,
    sunrise: z.array(z.string()),
    sunset: z.array(z.string()),
    uv_index_max: numberSeries,
    precipitation_probability_max: numberSeries,
    wind_speed_10m_max: numberSeries
  })
});
export type UpstreamForecast = z.infer<typeof upstreamForecastSchema>;

export const currentWeatherSchema = z.object({
  time: z.string(),
  weatherCode: z.number(),
  isDay: z.boolean(),
  temperature: z.number(),
  apparentTemperature: z.number(),
  humidity: z.number(),
  precipitation: z.number(),
  windSpeed: z.number(),
  windDirection: z.number(),
  pressure: z.number(),
  visibility: z.number(),
  uvIndex: z.number()
});

export const hourlyEntrySchema = z.object({
  time: z.string(),
  temperature: z.number().nullable(),
  apparentTemperature: z.number().nullable(),
  weatherCode: z.number().nullable(),
  isDay: z.boolean().nullable(),
  precipitationProbability: z.number().nullable()
});

export const dailyEntrySchema = z.object({
  date: z.string(),
  weatherCode: z.number().nullable(),
  temperatureMax: z.number().nullable(),
  temperatureMin: z.number().nullable(),
  sunrise: z.string(),
  sunset: z.string(),
  uvIndexMax: z.number().nullable(),
  precipitationProbabilityMax: z.number().nullable(),
  windSpeedMax: z.number().nullable()
});

export const weatherResponseSchema = z.object({
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    timezone: z.string(),
    timezoneAbbreviation: z.string(),
    utcOffsetSeconds: z.number()
  }),
  units: z.object({
    temperature: z.string(),
    windSpeed: z.string(),
    precipitation: z.string(),
    pressure: z.string(),
    visibility: z.string(),
    humidity: z.string()
  }),
  current: currentWeatherSchema,
  hourly: z.array(hourlyEntrySchema),
  daily: z.array(dailyEntrySchema)
});
export type WeatherResponse = z.infer<typeof weatherResponseSchema>;
export type CurrentWeather = z.infer<typeof currentWeatherSchema>;
export type HourlyEntry = z.infer<typeof hourlyEntrySchema>;
export type DailyEntry = z.infer<typeof dailyEntrySchema>;
