import type { NominatimReverse } from '@/lib/schemas/reverse';
import type { GeocodingResponse, NominatimSearch, SearchResult } from '@/lib/schemas/search';
import type { UpstreamForecast, WeatherResponse } from '@/lib/schemas/weather';

const toBool = (n: number | null) => (n == null ? null : n === 1);

// Open-Meteo repeats a name across fields for some places (e.g. Tokyo, whose admin1 is also
// "Tokyo"), so drop duplicate parts when composing the label.
const composeLabel = (parts: Array<string | undefined>): string => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of parts) {
    if (!part) continue;
    const key = part.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(part);
  }
  return out.join(', ');
};

export const toSearchResults = (upstream: GeocodingResponse): SearchResult[] => {
  return (upstream.results ?? []).map(r => ({
    id: String(r.id),
    name: r.name,
    label: composeLabel([r.name, r.admin1, r.country]),
    country: r.country,
    countryCode: r.country_code,
    admin1: r.admin1,
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone
  }));
};

export const nominatimToSearchResults = (places: NominatimSearch): SearchResult[] => {
  return places.map(p => {
    const a = p.address;
    const name =
      a?.city ??
      a?.town ??
      a?.village ??
      a?.suburb ??
      a?.county ??
      a?.postcode ??
      p.name ??
      p.display_name.split(',')[0]?.trim() ??
      p.display_name;
    return {
      id: `osm:${p.place_id}`,
      name,
      label: composeLabel([name, a?.postcode, a?.state, a?.country]),
      country: a?.country,
      countryCode: a?.country_code?.toUpperCase(),
      admin1: a?.state,
      latitude: Number(p.lat),
      longitude: Number(p.lon)
    };
  });
};

// Reduce a Nominatim reverse result to a single settlement name, preferring the most specific
// locality that's present. Returns "" when nothing usable is found, letting the caller fall back
// to the timezone-derived city.
export const reverseToLabel = (upstream: NominatimReverse): string => {
  const a = upstream.address;
  const place =
    a?.city ?? a?.town ?? a?.village ?? a?.municipality ?? a?.suburb ?? a?.county ?? a?.state;
  if (place) return place;
  return upstream.display_name?.split(',')[0]?.trim() ?? '';
};

export const toWeather = (
  upstream: UpstreamForecast,
  query: { latitude: number; longitude: number }
): WeatherResponse => {
  const { current: c, current_units: cu, hourly: h, daily: d } = upstream;

  return {
    location: {
      latitude: query.latitude,
      longitude: query.longitude,
      timezone: upstream.timezone,
      timezoneAbbreviation: upstream.timezone_abbreviation,
      utcOffsetSeconds: upstream.utc_offset_seconds
    },
    units: {
      temperature: cu.temperature_2m ?? '°C',
      windSpeed: cu.wind_speed_10m ?? 'km/h',
      precipitation: cu.precipitation ?? 'mm',
      pressure: cu.surface_pressure ?? 'hPa',
      visibility: cu.visibility ?? 'm',
      humidity: cu.relative_humidity_2m ?? '%'
    },
    current: {
      time: c.time,
      weatherCode: c.weather_code,
      isDay: c.is_day === 1,
      temperature: c.temperature_2m,
      apparentTemperature: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      precipitation: c.precipitation,
      windSpeed: c.wind_speed_10m,
      windDirection: c.wind_direction_10m,
      pressure: c.surface_pressure,
      visibility: c.visibility,
      uvIndex: c.uv_index
    },
    hourly: h.time.map((time, i) => ({
      time,
      temperature: h.temperature_2m[i] ?? null,
      apparentTemperature: h.apparent_temperature[i] ?? null,
      weatherCode: h.weather_code[i] ?? null,
      isDay: toBool(h.is_day[i] ?? null),
      precipitationProbability: h.precipitation_probability[i] ?? null
    })),
    daily: d.time.map((date, i) => ({
      date,
      weatherCode: d.weather_code[i] ?? null,
      temperatureMax: d.temperature_2m_max[i] ?? null,
      temperatureMin: d.temperature_2m_min[i] ?? null,
      sunrise: d.sunrise[i],
      sunset: d.sunset[i],
      uvIndexMax: d.uv_index_max[i] ?? null,
      precipitationProbabilityMax: d.precipitation_probability_max[i] ?? null,
      windSpeedMax: d.wind_speed_10m_max[i] ?? null
    }))
  };
};
