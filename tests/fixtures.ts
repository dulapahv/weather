import type { NominatimReverse } from '@/lib/schemas/reverse';
import type { GeocodingResponse, NominatimSearch } from '@/lib/schemas/search';
import type { UpstreamForecast } from '@/lib/schemas/weather';

export const nominatimSearchFixture: NominatimSearch = [
  {
    place_id: 240109189,
    lat: '51.50100',
    lon: '-0.14200',
    display_name: 'SW1A 1AA, City of Westminster, London, England, United Kingdom',
    address: {
      city: 'London',
      state: 'England',
      postcode: 'SW1A 1AA',
      country: 'United Kingdom',
      country_code: 'gb'
    }
  }
];

export const nominatimReverseFixture: NominatimReverse = {
  display_name: 'London, Greater London, England, United Kingdom',
  address: {
    city: 'London',
    county: 'Greater London',
    state: 'England',
    country: 'United Kingdom'
  }
};

export const geocodingFixture: GeocodingResponse = {
  results: [
    {
      id: 2643743,
      name: 'London',
      latitude: 51.50853,
      longitude: -0.12574,
      country: 'United Kingdom',
      country_code: 'GB',
      admin1: 'England',
      admin2: 'Greater London',
      timezone: 'Europe/London'
    }
  ]
};

export const forecastFixture: UpstreamForecast = {
  latitude: 51.5,
  longitude: 0,
  utc_offset_seconds: 3600,
  timezone: 'Europe/London',
  timezone_abbreviation: 'GMT+1',
  elevation: 1,
  current_units: {
    time: 'iso8601',
    interval: 'seconds',
    temperature_2m: '°C',
    relative_humidity_2m: '%',
    apparent_temperature: '°C',
    is_day: '',
    precipitation: 'mm',
    weather_code: 'wmo code',
    wind_speed_10m: 'km/h',
    wind_direction_10m: '°',
    surface_pressure: 'hPa',
    visibility: 'm',
    uv_index: ''
  },
  current: {
    time: '2026-06-30T21:30',
    interval: 900,
    temperature_2m: 24.9,
    relative_humidity_2m: 64,
    apparent_temperature: 25.7,
    is_day: 0,
    precipitation: 0,
    weather_code: 2,
    wind_speed_10m: 13.7,
    wind_direction_10m: 225,
    surface_pressure: 1014.8,
    visibility: 37320,
    uv_index: 0
  },
  hourly_units: {
    time: 'iso8601',
    temperature_2m: '°C',
    apparent_temperature: '°C',
    weather_code: 'wmo code',
    is_day: '',
    precipitation_probability: '%'
  },
  hourly: {
    time: ['2026-06-30T00:00', '2026-06-30T06:00'],
    temperature_2m: [25.7, 22.5],
    apparent_temperature: [26, 23],
    weather_code: [0, 51],
    is_day: [0, 1],
    precipitation_probability: [0, null]
  },
  daily_units: {
    time: 'iso8601',
    weather_code: 'wmo code',
    temperature_2m_max: '°C',
    temperature_2m_min: '°C',
    sunrise: 'iso8601',
    sunset: 'iso8601',
    uv_index_max: '',
    precipitation_probability_max: '%',
    wind_speed_10m_max: 'km/h'
  },
  daily: {
    time: ['2026-06-30'],
    weather_code: [51],
    temperature_2m_max: [32.6],
    temperature_2m_min: [22],
    sunrise: ['2026-06-30T04:44'],
    sunset: ['2026-06-30T21:21'],
    uv_index_max: [6],
    precipitation_probability_max: [57],
    wind_speed_10m_max: [18.4]
  }
};
