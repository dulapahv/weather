import { ImageResponse } from 'next/og';

import { fetchForecast } from '@/lib/api/provider';
import { toWeather } from '@/lib/api/transform';
import { SITE_DESCRIPTION, SITE_TITLE } from '@/lib/site';
import { formatTemperature } from '@/lib/units';
import {
  conditionFamily,
  iconSrc,
  ogGradient,
  resolveCondition,
  type ConditionFamily
} from '@/lib/weather-codes';

const loadGoogleFont = async (font: string, weight: number, text: string): Promise<ArrayBuffer> => {
  const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!resource) throw new Error('Failed to load OG font');
  return (await fetch(resource[1])).arrayBuffer();
};

const loadFonts = async (text: string) => {
  const [bold, regular] = await Promise.all([
    loadGoogleFont('Geist', 600, text),
    loadGoogleFont('Geist', 400, text)
  ]);
  return [
    { name: 'Geist', data: bold, weight: 600, style: 'normal' },
    { name: 'Geist', data: regular, weight: 400, style: 'normal' }
  ] as const;
};

const brandCard = async (origin: string) => {
  const fonts = await loadFonts(`${SITE_TITLE}${SITE_DESCRIPTION}`);

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: ogGradient('partly-cloudy', true),
        color: '#ffffff',
        fontFamily: 'Geist'
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${origin}${iconSrc('partly-cloudy')}`} width={200} height={200} alt="" />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 600,
            lineHeight: 1.1,
            maxWidth: 980
          }}
        >
          {SITE_TITLE}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 34,
            color: 'rgba(255,255,255,0.85)',
            marginTop: 20
          }}
        >
          {SITE_DESCRIPTION}
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [...fonts],
      headers: {
        'cache-control': 'public, max-age=86400, s-maxage=86400'
      }
    }
  );
};

export const GET = async (request: Request) => {
  // The icon must be fetched from a URL the Worker can actually reach, not the NEXT_PUBLIC_SITE_URL.
  const { origin, searchParams } = new URL(request.url);
  const latRaw = searchParams.get('lat');
  const lonRaw = searchParams.get('lon');
  const latitude = latRaw ? Number(latRaw) : NaN;
  const longitude = lonRaw ? Number(lonRaw) : NaN;
  const name = searchParams.get('name')?.slice(0, 60);

  if (!name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return brandCard(origin);
  }

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

  const text = `${name}${condition}${temp}Feels like ${feels}`;
  const fonts = await loadFonts(text);

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
      fonts: [...fonts],
      headers: {
        'cache-control': 'public, max-age=600, s-maxage=600'
      }
    }
  );
};
