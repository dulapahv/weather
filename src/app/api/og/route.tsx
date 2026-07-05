import { ImageResponse } from 'next/og';

import { fetchForecast } from '@/lib/api/provider';
import { toWeather } from '@/lib/api/transform';
import { formatTemperature } from '@/lib/units';
import {
  conditionFamily,
  iconSrc,
  ogGradient,
  resolveCondition,
  type ConditionFamily
} from '@/lib/weather-codes';

const DEFAULT = { lat: 13.7563, lon: 100.5018, name: 'Bangkok' };

const loadGoogleFont = async (font: string, weight: number, text: string): Promise<ArrayBuffer> => {
  const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!resource) throw new Error('Failed to load OG font');
  return (await fetch(resource[1])).arrayBuffer();
};

export const GET = async (request: Request) => {
  // The icon must be fetched from a URL the Worker can actually reach, not the NEXT_PUBLIC_SITE_URL.
  const { origin, searchParams } = new URL(request.url);
  const lat = Number(searchParams.get('lat'));
  const lon = Number(searchParams.get('lon'));
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lon);
  const latitude = hasCoords ? lat : DEFAULT.lat;
  const longitude = hasCoords ? lon : DEFAULT.lon;
  const name = searchParams.get('name')?.slice(0, 60) || DEFAULT.name;

  let temp = '—';
  let feels = '';
  let condition = 'Weather';
  let icon = 'overcast';
  let isDay = true;
  let family: ConditionFamily = 'overcast';

  try {
    const upstream = await fetchForecast({
      latitude,
      longitude,
      temperatureUnit: 'celsius',
      windSpeedUnit: 'kmh',
      precipitationUnit: 'mm'
    });
    const weather = toWeather(upstream, { latitude, longitude });
    const resolved = resolveCondition(weather.current.weatherCode);
    temp = formatTemperature(weather.current.temperature);
    feels = formatTemperature(weather.current.apparentTemperature);
    condition = resolved.description;
    icon = resolved.icon;
    isDay = weather.current.isDay;
    family = conditionFamily(weather.current.weatherCode);
  } catch {
    // Render a graceful card even if the upstream call fails.
  }

  const text = `WEATHER${name}${condition}${temp}Feels like ${feels}Fast, accessible forecasts`;
  const [bold, regular] = await Promise.all([
    loadGoogleFont('Geist', 600, text),
    loadGoogleFont('Geist', 400, text)
  ]);

  const background = ogGradient(family, isDay);

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: 72,
        background,
        color: '#ffffff',
        fontFamily: 'Geist'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 620 }}>
          <div style={{ display: 'flex', fontSize: 76, fontWeight: 600, lineHeight: 1.05 }}>
            {name}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 40,
              color: 'rgba(255,255,255,0.85)',
              marginTop: 12
            }}
          >
            {condition}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 28,
              color: 'rgba(255,255,255,0.55)',
              marginTop: 20
            }}
          >
            Feels like {feels}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${origin}${iconSrc(icon)}`} width={200} height={200} alt="" />
          <div style={{ display: 'flex', fontSize: 180, fontWeight: 600, letterSpacing: -4 }}>
            {temp}
          </div>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Geist', data: bold, weight: 600, style: 'normal' },
        { name: 'Geist', data: regular, weight: 400, style: 'normal' }
      ],
      headers: {
        'cache-control': 'public, max-age=600, s-maxage=600'
      }
    }
  );
};
