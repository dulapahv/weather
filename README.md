# Weather

**A weather app.**

Search any city or postcode, save, share, and reorder favorite locations, and get current conditions, an hourly forecast, and a 10-day outlook, with your preferred units in the location's own timezone, refreshed every 5 minutes.

**Live: [weather.dulapahv.dev](https://weather.dulapahv.dev)**

**Dev: [weather-dev.dulapahv.dev](https://weather-dev.dulapahv.dev)**

**Design: [Figma](https://www.figma.com/design/90YSbIMv117Mqel7gikBT5/Weather?node-id=0-1&t=pkiZr89Fkuc4JJUM-1)**

## Table of contents

- [Table of contents](#table-of-contents)
- [Getting started](#getting-started)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Scripts](#scripts)
- [Architecture](#architecture)
  - [Project structure](#project-structure)
- [API](#api)
  - [`GET /api/weather`](#get-apiweather)
  - [`GET /api/search`](#get-apisearch)
  - [`GET /api/geo`](#get-apigeo)
  - [`GET /api/reverse`](#get-apireverse)
  - [`GET /api/og`](#get-apiog)
- [Key decisions \& trade-offs](#key-decisions--trade-offs)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Requirements \& satisfaction](#requirements--satisfaction)
  - [Functional requirements](#functional-requirements)
    - [Must have](#must-have)
    - [Should have](#should-have)
    - [Could have](#could-have)
  - [Non-functional requirements](#non-functional-requirements)
    - [Must have](#must-have-1)
    - [Should have](#should-have-1)
    - [Could have](#could-have-1)
  - [Won't have](#wont-have)
- [With more time](#with-more-time)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)
- [License](#license)

## Getting started

Prerequisites: **Node.js 20+** and **pnpm**.

```bash
pnpm install
pnpm dev
```

If you don't have `pnpm` installed, you can install it globally:

```bash
npm install -g pnpm
```

Open [http://localhost:3000](http://localhost:3000). No API keys or environment variables are required.

## Features

- **Search** - city or postcode autocomplete ([Open-Meteo](https://open-meteo.com/) geocoding, with [Nominatim](https://nominatim.org/) fallback for postcodes)
- **Current location** - GPS with graceful fallback to IP-based approximation
- **Saved locations** - add, remove, and reorder (keyboard-accessible drag and drop), with the current location pinned first
- **Forecasts** - current conditions, hourly, 10 days, plus feels-like, wind, humidity, visibility, pressure, UV index, sunrise/sunset, and precipitation
- **Units** - temperature, wind speed, precipitation, pressure, distance, and 12/24-hour clock, persisted across sessions, with restore defaults and settings import/export
- **Share** - deep-linkable location URLs with dynamically generated Open Graph images
- **Offline and installable** - a PWA whose service worker serves the last-fetched weather when the network drops
- **Themes** - light and dark, respects system preference and `prefers-reduced-motion`
- **Feature flags** - runtime flags via [Cloudflare Flagship](https://developers.cloudflare.com/flagship/), read server-side

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js (App Router) + TypeScript + React |
| Styling | SCSS Modules + CSS for theming |
| Client data | [SWR](https://swr.vercel.app/) (5-minute polling, stale-while-revalidate) |
| App state | Zustand + `persist` (localStorage), [next-themes](https://github.com/pacocoursey/next-themes) for theme |
| Rendering performance | React Compiler (build-time auto-memoization) |
| Drag and drop | [@dnd-kit](https://dndkit.com/) with pointer and keyboard sensors |
| Validation | Zod at every BFF boundary (inputs and upstream responses) |
| Weather data | [Open-Meteo](https://open-meteo.com/) - keyless, proxied through a BFF |
| Geocoding | [Open-Meteo](https://open-meteo.com/en/docs/geocoding-api) for names, [Nominatim](https://nominatim.org/) for postcodes and reverse lookups |
| Feature flags | [Cloudflare Flagship](https://developers.cloudflare.com/flagship/) binding, read server-side |
| Analytics | [Cloudflare Zaraz](https://developers.cloudflare.com/zaraz/) to [Amplitude](https://amplitude.com/), injected at the edge with zero client-bundle cost |
| Error monitoring | [Sentry](https://sentry.io/), with production source maps uploaded from CI for readable stack traces |
| Images | [Cloudflare Image Transformations](https://developers.cloudflare.com/images/transform-images/) via a custom `next/image` loader |
| PWA / offline | Web manifest + a small hand-rolled service worker |
| Deployment | Cloudflare Workers via [OpenNext](https://opennext.js.org/cloudflare) |
| Testing | Vitest + Testing Library + MSW, Playwright + axe-core |

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm test` | Unit and integration tests with coverage (Vitest, 90% line threshold) |
| `pnpm test:watch` | Tests in watch mode |
| `pnpm test:e2e` | E2E and accessibility tests (Playwright + axe)<sup>1</sup> |
| `pnpm lint` / `pnpm lint:fix` | ESLint check / autofix |
| `pnpm format` / `pnpm format:fix` | Prettier check / rewrite |
| `pnpm preview` | Build and preview on the real Workers runtime<sup>2</sup> |
| `pnpm deploy:dev` / `pnpm deploy:prod` | Build and deploy to Cloudflare<sup>2</sup> |
| `pnpm cf-typegen` | Regenerate `CloudflareEnv` types from `wrangler.jsonc` |

<sup>1</sup>First run: `pnpm exec playwright install chromium`. The E2E suite builds and serves the app itself (port 3100) and mocks all API routes, so it needs no network access to upstream providers.

<sup>2</sup>The OpenNext build runs on Linux/macOS (use WSL on Windows). Deploys normally happen through CI, not from a local machine.

## Architecture

```txt
Browser                           Cloudflare Worker                          Upstream
───────────────                   ───────────────────────────                ────────
SWR poll (5 min) ──/api/weather──▶ rate limit → validate → fetch → Zod ────▶ Open-Meteo forecast
debounced search ──/api/search───▶ rate limit → validate → fetch → Zod─────▶ Open-Meteo geocoding, then Nominatim
reverse geocode ───/api/reverse──▶ rate limit → validate → fetch → Zod─────▶ Nominatim
location fallback ─/api/geo──────▶ Cloudflare edge IP geolocation
share previews ────/api/og───────▶ rate limit → live fetch, render OG image ───▶ Open-Meteo forecast
Zustand (localStorage), next-themes (data-theme)
```

The client never talks to weather providers directly. Route handlers under `src/app/api/` act as a Backend-For-Frontend (BFF). They validate inputs, sanitize upstream responses into a stable contract using Zod, handle caching, and rate-limit by IP via [Cloudflare Workers KV](https://developers.cloudflare.com/kv/).

### Project structure

```
public/             # Self-hosted weather icons, service worker (sw.js), _headers
src/
├── app/            # Layout, dashboard page, manifest, loading/error UI, BFF route handlers in api/
├── components/     # Co-located component + styles + tests per folder
├── hooks/          # useWeather (SWR), useSearch, useGeolocation, useOnlineStatus, useMediaQuery, ...
├── lib/            # units, datetime, weather-codes, flags, preferences-io, api/ (BFF helpers), schemas/ (Zod)
├── store/          # Zustand preferences store (locations, units)
├── providers/      # Theme + SWR providers
├── styles/         # Shared SCSS tokens, breakpoints, mixins
├── tests/          # Vitest setup, MSW server, fixtures
└── e2e/            # Playwright specs + fixtures
```

## API

All data flows through the BFF endpoints. Request and response shapes are defined in `src/lib/schemas/`. Errors share a standard shape: `{ "error": { "status": number, "message": string } }` (400 for invalid params, 429 for rate limits, 502/504 for upstream issues). All upstream-fetching endpoints (`/api/weather`, `/api/search`, `/api/reverse`, `/api/og`) are limited to 60 requests per minute per IP.

| Method and path | Purpose |
| --- | --- |
| `GET /api/weather` | Current conditions plus hourly and 10-day forecast for coordinates |
| `GET /api/search` | Geocode a place by name or postcode |
| `GET /api/geo` | Approximate location from the caller's IP |
| `GET /api/reverse` | Reverse geocode coordinates to a place name |
| `GET /api/og` | Dynamic Open Graph image for shared links |

### `GET /api/weather`

Request schema (query string, validated by `weatherQuerySchema` in `src/lib/schemas/weather.ts`):

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| `latitude` | number | yes | -90 to 90 |
| `longitude` | number | yes | -180 to 180 |
| `temperatureUnit` | string | no | `celsius` or `fahrenheit`, default `celsius` |
| `windSpeedUnit` | string | no | `kmh`, `ms`, `mph`, or `kn`, default `kmh` |
| `precipitationUnit` | string | no | `mm` or `inch`, default `mm` |

Sample request:

```bash
curl "https://weather.dulapahv.dev/api/weather?latitude=51.5074&longitude=-0.1278&temperatureUnit=celsius"
```

Response schema (`weatherResponseSchema` in `src/lib/schemas/weather.ts`):

```ts
{
  location: {
    latitude: number
    longitude: number
    timezone: string              // IANA zone, e.g. "Europe/London"
    timezoneAbbreviation: string
    utcOffsetSeconds: number
  }
  units: {                        // display units for the values below
    temperature: string           // e.g. "°C"
    windSpeed: string
    precipitation: string
    pressure: string
    visibility: string
    humidity: string
  }
  current: {
    time: string                  // location-local wall clock, no offset
    weatherCode: number           // WMO code, mapped to icon + description in lib/weather-codes.ts
    isDay: boolean
    temperature: number
    apparentTemperature: number
    humidity: number
    precipitation: number
    windSpeed: number
    windDirection: number
    pressure: number
    visibility: number
    uvIndex: number
  }
  hourly: Array<{
    time: string
    temperature: number | null
    apparentTemperature: number | null
    weatherCode: number | null
    isDay: boolean | null
    precipitationProbability: number | null
  }>
  daily: Array<{
    date: string
    weatherCode: number | null
    temperatureMax: number | null
    temperatureMin: number | null
    sunrise: string
    sunset: string
    uvIndexMax: number | null
    precipitationProbabilityMax: number | null
    windSpeedMax: number | null
  }>
}
```

Sample response, with `hourly` and `daily` trimmed to one entry each:

```json
{
  "location": { "latitude": 51.5, "longitude": -0.12, "timezone": "Europe/London", "timezoneAbbreviation": "GMT+1", "utcOffsetSeconds": 3600 },
  "units": { "temperature": "°C", "windSpeed": "km/h", "precipitation": "mm", "pressure": "hPa", "visibility": "m", "humidity": "%" },
  "current": { "time": "2026-06-30T14:30", "weatherCode": 2, "isDay": true, "temperature": 18.4, "apparentTemperature": 17.9, "humidity": 64, "precipitation": 0, "windSpeed": 13.7, "windDirection": 225, "pressure": 1014.8, "visibility": 24000, "uvIndex": 4.2 },
  "hourly": [{ "time": "2026-06-30T14:00", "temperature": 18.1, "apparentTemperature": 17.6, "weatherCode": 2, "isDay": true, "precipitationProbability": 12 }],
  "daily": [{ "date": "2026-06-30", "weatherCode": 3, "temperatureMax": 21, "temperatureMin": 13, "sunrise": "2026-06-30T04:44", "sunset": "2026-06-30T21:21", "uvIndexMax": 6, "precipitationProbabilityMax": 40, "windSpeedMax": 18 }]
}
```

All times are the location's local wall clock and are rendered as-is, never converted to the viewer's timezone.

### `GET /api/search`

Request schema (query string, validated by `searchQuerySchema` in `src/lib/schemas/search.ts`):

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| `q` | string | yes | Place name or postcode, 1 to 100 characters |
| `count` | number | no | Max results, 1 to 20, default 5 |

Sample request:

```bash
curl "https://weather.dulapahv.dev/api/search?q=SW1A%201AA"
```

Response schema (`searchResponseSchema` in `src/lib/schemas/search.ts`, optional fields may be absent):

```ts
{
  results: Array<{
    id: string
    name: string
    label: string        // full display label, e.g. "London, England, United Kingdom"
    latitude: number
    longitude: number
    country?: string
    countryCode?: string
    admin1?: string      // first-level admin area, e.g. "England"
    timezone?: string
  }>
}
```

Sample response:

```json
{
  "results": [
    { "id": "2643743", "name": "London", "label": "London, England, United Kingdom", "country": "United Kingdom", "countryCode": "GB", "admin1": "England", "latitude": 51.50853, "longitude": -0.12574, "timezone": "Europe/London" }
  ]
}
```

### `GET /api/geo`

No parameters. Resolves an approximate location from Cloudflare's edge IP geolocation, falling back to a default city when that is unavailable.

Sample request:

```bash
curl "https://weather.dulapahv.dev/api/geo"
```

Response schema, where `source` is `"ip"` or `"default"`:

```ts
{ latitude: number, longitude: number, label: string, source: 'ip' | 'default' }
```

Sample response:

```json
{ "latitude": 51.5074, "longitude": -0.1278, "label": "London", "source": "ip" }
```

### `GET /api/reverse`

Request schema (query string, validated by `reverseQuerySchema` in `src/lib/schemas/reverse.ts`):

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| `lat` | number | yes | -90 to 90 |
| `lon` | number | yes | -180 to 180 |

Sample request:

```bash
curl "https://weather.dulapahv.dev/api/reverse?lat=51.5074&lon=-0.1278"
```

Response schema is `{ label: string }` (`reverseResponseSchema` in `src/lib/schemas/reverse.ts`), where `label` is the closest place name or an empty string when none is found. Sample response:

```json
{ "label": "London" }
```

### `GET /api/og`

Returns a 1200x630 PNG image rather than JSON. Given `lat`, `lon`, and `name`, it fetches that location's current conditions server-side and renders a live weather card. Without them it falls back to the default brand card. `generateMetadata` in `src/app/page.tsx` points shared links here for rich previews.

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| `lat` | number | no | -90 to 90, required together with `lon` and `name` for a location card |
| `lon` | number | no | -180 to 180 |
| `name` | string | no | Display name, capped at 60 characters |
| `v` | string | no | Cache-busting key, since location cards are cached for 5 minutes |

Sample request:

```bash
curl "https://weather.dulapahv.dev/api/og?lat=51.5074&lon=-0.1278&name=London" --output og.png
```

## Key decisions & trade-offs

- **SWR (plus a small Zustand store) over Redux and React Query:** Redux is a general-purpose state container. It doesn't natively fetch or cache server data without adding RTK Query. Since almost all state in this app is server-owned (weather readings on a 5-minute cycle), I evaluated SWR and React Query instead. SWR won on fit and bundle size. It easily handles 5-minute polling, keeps location switches flicker-free, and deduplicates requests out of the box. React Query can do all this, but its extra machinery for data mutations and cache invalidation is overkill for a read-only app. For the tiny bit of true client state we do have (saved locations and unit preferences), a single Zustand store with localStorage persistence is plenty. Setting up Redux boilerplate for two objects didn't make sense.
*The trade-off:* If the app eventually needs server writes, like user accounts or saving alerts, React Query's mutation tooling would easily justify its extra weight.

- **Workers KV over a Durable Object for rate limiting:** The API limits IPs to 60 requests per minute. A Durable Object would count this perfectly, whereas KV's read-then-increment approach allows a few requests to slip through at window boundaries under heavy concurrent load. I chose KV anyway for two reasons: speed of delivery and fallback safety. First, I could ship KV confidently under a deadline. Because I kept the limiter as a pure function over a simple store interface, I could easily unit test it against an in-memory `Map` rather than spinning up a Workers runtime just to test a Durable Object. Second, to respect free-tier quotas, the limiter treats KV as best-effort. If KV fails or hits a limit, it gracefully falls back to an in-memory per-instance counter so the API never goes down due to its own guard.
*The trade-off:* The rate limiting is slightly fuzzy. This is perfectly acceptable for a free API abuse guard. If we ever introduced paid quotas, we'd need to swap to a Durable Object, but the abstracted store interface makes that an easy pivot.

- **Open-Meteo as the weather provider:** It's free, keyless, and covers everything from current conditions to multi-day forecasts.
*The trade-off:* Its geocoder only handles place names. Instead of swapping providers entirely, `/api/search` falls back to Nominatim for postcodes, introducing a second dependency.

- **Cloudflare Workers over Vercel:** Vercel is the default home for Next.js, but Cloudflare Workers offers a significantly more generous free tier for a public demo, most notably, zero bandwidth caps compared to Vercel Hobby's 100 GB monthly limit. This ensures a sudden traffic spike cannot take the app down or force an unexpected plan upgrade. Cloudflare also provides excellent global TTFB by executing code at the nearest of its 300+ edge locations. Operating directly on Workers grants native platform bindings configured entirely in `wrangler.jsonc` without external SDKs or API keys: Workers KV powers the rate limiter, Flagship handles runtime feature flags, and the edge `cf` object provides instant IP geolocation for `/api/geo`. For media optimization, a custom image loader (`image-loader.ts`) rewrites `next/image` URLs to utilize Cloudflare Image Transformations (`/cdn-cgi/image/...`), shifting resizing and format conversion to the edge automatically.
*The trade-off:* Vercel provides a zero-config deployment experience with native, first-class Next.js support. Deploying to Workers relies on the community-driven OpenNext adapter, which adds an extra build step, can occasionally lag behind major Next.js releases, and introduces environment constraints such as lack of native Windows build support. The free plan also caps the compressed Worker bundle at 3 MB, so heavy server-side dependencies are a real constraint to watch.

- **Deploying to production from day one:** The CI pipeline and Cloudflare deployment were built before any UI. This surfaced platform constraints early (e.g., OpenNext not building on Windows).
*The trade-off:* Higher initial setup time, but it eliminates end-of-project deployment anxiety.

## Testing

- **Unit and integration.** Vitest suites live next to the code they test. BFF route handlers, the rate limiter, Zod transforms, unit conversions, datetime helpers, the Zustand store, import/export, and component behavior up to the full `AppShell` rendered against MSW-mocked APIs. A 90% line-coverage threshold is enforced in CI (`vitest.config.mts`).
- **End to end.** Playwright builds and serves the real app with all API routes mocked (`src/e2e/app.spec.ts`), then drives the core journeys. The initial load resolves a location and renders conditions, search-and-add updates the detail view, and an axe-core scan asserts zero WCAG 2.2 AA violations with reduced motion emulated.

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs three parallel quality gates on every push and PR: **verify** (Prettier, ESLint, unit tests with a coverage artifact), **e2e** (Playwright with cached browsers), and **lighthouse** (Lighthouse CI against the budgets in `lighthouserc.json`). Deploys run only when all three pass. Pushes to `develop` deploy to the dev environment and pushes to `main` deploy to production, shipping via OpenNext to Cloudflare Workers. Deploy builds also wire up Sentry, CI injects the DSN and uploads production source maps, so runtime errors show readable stack traces against the original TypeScript instead of minified bundle frames. Forks without the Sentry variables and secret configured simply skip the upload.

## Requirements & satisfaction

Requirements were derived from the coding-exercise brief and the job description, then prioritized with MoSCoW. Priorities are aligned to the brief: everything its core requirements ask for is Must Have, its optional enhancements sit in Should Have, and extras we chose to add land in Could Have. Every item is delivered, each with a note on how and where. Ideas that didn't make the cut live under [With more time](#with-more-time).

### Functional requirements

#### Must have

- [x] The user shall be able to search for a city or postcode.
  - The search box in `src/components/Sidebar/SearchBar/SearchBar.tsx` calls `GET /api/search` (`src/app/api/search/route.ts`), which tries Open-Meteo geocoding and falls back to Nominatim for postcodes (`src/lib/api/provider.ts`).
- [x] The user shall be presented with autocomplete suggestions while typing.
  - `SearchBar` is an ARIA combobox with a `role="listbox"` suggestion list, fed by `src/hooks/useSearch.ts` with debouncing from `src/hooks/useDebouncedValue.ts`.
- [x] The user shall be able to select a city from search results.
  - Choosing a suggestion saves the location and switches the detail view to it (`handleSearchSelect` in `src/components/AppShell/AppShell.tsx`).
- [x] The user shall be able to view weather information for their current location.
  - `src/hooks/useGeolocation.ts` resolves GPS coordinates and reverse geocodes a label through `src/app/api/reverse/route.ts`.
- [x] The user's current location shall be pinned as the first item in the saved locations list and excluded from manual reordering.
  - `AppShell` marks the current location `pinned`, and `src/components/Sidebar/LocationList/LocationList.tsx` renders it above the sortable list, outside the drag context.
- [x] The user shall be able to save locations to a favorites list.
  - `addLocation` in `src/store/preferences.ts`, deduplicated by id and persisted to localStorage.
- [x] The user shall be able to reorder saved locations (excluding the pinned current location).
  - Drag and drop in edit mode via @dnd-kit with both pointer and keyboard sensors (`LocationList.tsx`), constrained by `src/lib/dnd-modifiers.ts`, committed by `reorderLocations` in the store.
- [x] The user shall be able to remove saved locations.
  - Remove buttons in edit mode with per-location `aria-label`s (`LocationList.tsx`). If the selected location is removed, selection falls back to the current location.
- [x] The user shall be able to collapse and expand the saved locations list.
  - The sidebar collapses on desktop and becomes a dismissible drawer on mobile (`src/components/AppShell/AppShell.tsx`, `src/components/Sidebar/Sidebar.tsx`).
- [x] The user shall be able to view current weather conditions.
  - `src/components/CurrentConditions/CurrentConditions.tsx`, with the icon and description resolved from the WMO `weather_code` in `src/lib/weather-codes.ts`.
- [x] The user shall be able to view hourly weather forecasts.
  - `src/components/HourlyForecast/HourlyForecast.tsx` renders a scrollable strip of per-hour temperature, condition, and precipitation probability.
- [x] The user shall be able to view a 10-day weather forecast.
  - `src/components/TenDayForecast/TenDayForecast.tsx`. The BFF requests `forecast_days=10` from Open-Meteo (`src/lib/api/provider.ts`).
- [x] The user shall be able to view weather metrics including: Feels Like Temperature, Wind, Humidity, Visibility, Pressure, UV Index, Sunrise/Sunset, and Precipitation.
  - `src/components/MetricGrid/MetricGrid.tsx` renders all eight. The brief's required wind speed and humidity live here.
- [x] The user shall be able to view weather summary cards for saved locations including: Name, Current Temperature, Daily High, Daily Low, and Weather Condition, shown in the user's selected units.
  - Each row in `LocationList.tsx` (`SelectableRow`) shows name, local time, condition, current temperature, and high/low, sharing the SWR cache with the detail view.
- [x] The user shall be able to select temperature units (°C or °F).
  - Settings dialog segment (`src/components/Sidebar/SettingsDialog/SettingsDialog.tsx`). The unit is part of the SWR key (`src/hooks/useWeather.ts`), so data refetches in the requested unit.
- [x] The user shall be able to restore default settings.
  - `resetDefaults` in `src/store/preferences.ts`, exposed as a button in the settings dialog.
- [x] User preferences shall persist across browser sessions.
  - Zustand `persist` middleware writes to localStorage under `weather-prefs` (`src/store/preferences.ts`).
- [x] When location permission is denied or unavailable, the application shall fall back gracefully (e.g. IP-based approximate location or a default city) and clearly communicate which location is shown.
  - Fallback chain GPS, then Cloudflare IP estimate (`src/app/api/geo/route.ts`), then a default city (`src/hooks/useGeolocation.ts`). The UI labels the source as "My location", "Approximate location", or "Default location" (`AppShell.tsx`).
- [x] The application shall display loading skeletons during data fetches and a clear empty state when no locations are saved.
  - `src/components/WeatherSkeleton/WeatherSkeleton.tsx` while locating or fetching, an empty state in the detail view (`AppShell.tsx`), and an empty message in the sidebar list (`LocationList.tsx`).

#### Should have

- [x] The user shall be able to export saved locations and preferences.
  - Settings, then Export downloads `weather-preferences.json` with units, locations, and theme (`exportPreferences` in `src/lib/preferences-io.ts`).
- [x] The user shall be able to import previously exported settings.
  - Import parses and Zod-validates the file (`importPreferencesFile` in `src/lib/preferences-io.ts`). Invalid files show an inline `role="alert"` error in the settings dialog instead of corrupting state.
- [x] The application shall provide API documentation including endpoints, request schema, response schema, example requests, and example responses.
  - The [API](#api) section above documents every endpoint with a request schema, a sample request, a response schema, and a sample response. The Zod schemas in `src/lib/schemas/` are the machine-checked source of those shapes.
- [x] All location-specific times (hourly forecast, sunrise, sunset) shall be displayed in the selected location's local timezone, not the viewer's.
  - The BFF returns the location's IANA timezone and naive local wall-clock times (`src/lib/api/transform.ts`), rendered as-is. Sidebar clocks use `Intl.DateTimeFormat` with the `timeZone` option (`src/lib/datetime.ts`).
- [x] When offline, the application shall display the most recently cached weather data with a clear staleness/offline indicator.
  - The service worker serves the last-cached `/api/*` responses and pages when the network fails (`networkFirst` in `public/sw.js`), and an offline banner with `role="status"` appears via `src/hooks/useOnlineStatus.ts` (`AppShell.tsx`).

#### Could have

- [x] The user shall be able to select wind speed units.
  - km/h, m/s, mph, or knots in the settings dialog, converted in `src/lib/units.ts`.
- [x] The user shall be able to select distance units.
  - km or miles. Visibility converts client-side (`src/lib/units.ts`) without a refetch.
- [x] The user shall be able to select pressure units and precipitation units.
  - hPa/inHg/mmHg and mm/in, plus a bonus 12/24-hour clock format (`SettingsDialog.tsx`, `src/lib/units.ts`).
- [x] The user shall be able to share a location via a Share control that produces a link carrying the location (coordinates + name), using the native share sheet where available, otherwise copying to the clipboard. Opening the link shall deep-link the app to that location.
  - `src/components/CurrentConditions/ShareButton/ShareButton.tsx` uses `navigator.share` with a clipboard fallback. Opening `?lat&lon&name` adds and selects the location, then cleans the URL (`src/app/page.tsx`, `AppShell.tsx`).
- [x] Shared links shall render a dynamically generated Open Graph image showing the location's name, temperature, condition, and a matching weather icon. A link without a location parameter falls back to a default location's card.
  - `src/app/api/og/route.tsx` renders the card, and `generateMetadata` in `src/app/page.tsx` points shared URLs at it with a 5-minute cache-busting key, matching the OG image cache TTL and the app's 5-minute refresh interval.

### Non-functional requirements

#### Must have

- [x] The system shall be implemented using Next.js, TypeScript, and SCSS.
  - Next.js 16 App Router with TypeScript, and SCSS Modules with shared tokens and mixins in `src/styles/`.
- [x] The system shall implement a BFF layer using Next.js Route Handlers.
  - Five route handlers under `src/app/api/` (`weather`, `search`, `reverse`, `geo`, and `og` for share images). The client never calls upstream providers.
- [x] The system shall use an appropriate combination of static, server, and client rendering.
  - The server renders the shell and resolves feature flags and share metadata (`src/app/layout.tsx`, `src/app/page.tsx`), the PWA manifest is a static metadata route (`src/app/manifest.ts`), and interactive weather UI is client components (`src/components/AppShell/AppShell.tsx`).
- [x] The system shall use React Suspense for asynchronous loading states.
  - `src/app/loading.tsx` is the route-level Suspense fallback that streams while the server resolves flags and search params. In-app fetches show skeleton states.
- [x] The application shall avoid unnecessary component re-renders, evidenced via [React Scan](https://react-scan.com/).
  - React Compiler (`reactCompiler: true` in `next.config.ts`) auto-memoizes, narrow Zustand selectors like `usePreferences(s => s.units)` avoid whole-store subscriptions (`AppShell.tsx`), and stable SWR keys with `keepPreviousData` keep updates scoped (`src/hooks/useWeather.ts`).
  - For example, typing in the search bar doesn't cause other components to re-render:
  <figure>
    <img src="docs/images/react-scan-search-isolation.png" alt="React Scan overlay while typing &quot;bang&quot; into the search bar: only the SearchBar component is outlined as re-rendering, while the location list and forecast panels stay untouched at 165 FPS." width="640"/>
    <figcaption>Typing in the search bar re-renders only the SearchBar — every other component stays idle.</figcaption>
  </figure>
  <figure>
    <img src="docs/images/react-scan-render-history.png" alt="React Scan history panel after typing in the search bar: four SearchBar renders of 5 to 27 milliseconds each, and SearchBar is the only entry in the ranked re-render list." width="640"/>
    <figcaption>React Scan's render history confirms SearchBar is the only component that re-rendered.</figcaption>
  </figure>
- [x] The application shall conform to WCAG 2.2 AA guidelines.
  - CI runs an axe-core scan tagged `wcag2a/aa`, `wcag21a/aa`, and `wcag22aa`, asserting zero violations (`src/e2e/app.spec.ts`), on top of semantic landmarks, a skip link, a native `<dialog>`, and labeled controls throughout.
- [x] The application shall support keyboard navigation.
  - Arrow-key roving focus in the locations list (`handleListArrowNav` in `LocationList.tsx`), keyboard-operable drag and drop (`KeyboardSensor` with `sortableKeyboardCoordinates`), an Esc-dismissible dialog, and a skip-to-content link (`AppShell.tsx`).
- [x] The application shall support responsive layouts across mobile, tablet, and desktop.
  - Breakpoint tokens and mixins in `src/styles/_breakpoints.scss` and `src/styles/_mixins.scss`, with the layout swapping between a mobile drawer and a desktop sidebar via `src/hooks/useMediaQuery.ts`.
- [x] The application shall support both light and dark themes.
  - `src/providers/ThemeProvider.tsx` (next-themes) toggles `data-theme`, and all theme colors are CSS custom properties in `src/app/globals.scss` with a `[data-theme='dark']` override block. Defaults to the system preference.
- [x] The application shall be deployed to Cloudflare Workers.
  - Live at [weather.dulapahv.dev](https://weather.dulapahv.dev) with a separate dev environment, configured in `wrangler.jsonc` and built with OpenNext.
- [x] The application shall be automatically deployed through a CI/CD pipeline.
  - GitHub Actions deploys `develop` to dev and `main` to production after the quality gates pass (`.github/workflows/ci.yml`).
- [x] The system shall include automated unit tests for critical business logic, utility functions, and reusable UI components.
  - Co-located `*.test.ts(x)` suites covering BFF routes, the rate limiter, transforms, units, datetime, the store, and components, with a 90% line-coverage threshold enforced in CI (`vitest.config.mts`).
- [x] The system shall implement error boundaries to prevent application-wide failures caused by unexpected runtime errors.
  - `src/app/error.tsx` is the route-level boundary, `src/app/global-error.tsx` is the last-resort boundary for errors in the root layout itself (rendering its own `<html>`/`<body>`), and fetch failures render a contained error state instead of unmounting the page (`ErrorState` in `AppShell.tsx`).
- [x] The system shall provide user-friendly error messages when weather data cannot be retrieved or processed.
  - `handleRouteError` in `src/lib/api/http.ts` maps upstream failures to human copy such as "We couldn't get the latest weather right now." The UI error state offers a **Try again** action.
- [x] The system shall be optimized for search engines through server-side rendering, metadata management, semantic HTML, and structured page content.
  - Server-rendered first paint, the Metadata API with canonical, Open Graph, and Twitter tags (`src/app/layout.tsx`), semantic landmarks and headings, and JSON-LD structured data.
- [x] The upstream weather-provider API key shall never be exposed to the client. All provider requests shall be proxied through the BFF.
  - Open-Meteo is keyless, so this is satisfied naturally. `src/lib/api/provider.ts`, the sole upstream caller, imports `server-only` ([server-only - NPM](https://www.npmjs.com/package/server-only)) to prevent server-specific code (e.g., secret keys) from accidentally being imported into client-side bundles.

#### Should have

- [x] The BFF layer shall expose documented API endpoints.
  - The [API](#api) section above, backed by the Zod schemas in `src/lib/schemas/` as the machine-checked contract.
- [x] Weather data shall be refreshed at least every 5 minutes.
  - SWR `refreshInterval: 300_000` against the BFF (`src/hooks/useWeather.ts`), aligned with the BFF cache policy.
- [x] The application shall minimize bundle size through code splitting, dynamic imports, and tree shaking.
  - Route-level code splitting, `optimizePackageImports` for per-icon imports (`next.config.ts`), and a minified Worker build.
- [x] Performance measurements shall be documented using Lighthouse and React Profiler.
  <figure>
    <img src="docs/images/lighthouse-scores.png" alt="Lighthouse report: Performance 100, Accessibility 100, Best Practices 96, SEO 100, with First Contentful Paint 0.3 s, Largest Contentful Paint 0.6 s, Total Blocking Time 10 ms, Cumulative Layout Shift 0.001, and Speed Index 1.0 s." width="640"/>
    <figcaption>Lighthouse scores for the production build: Performance 100, Accessibility 100, Best Practices 96, SEO 100.</figcaption>
  </figure>
  <figure>
    <img src="docs/images/profiler-location-switch.png" alt="React Profiler flamegraph of a location switch: a single 27.6 ms commit rooted at AppShell, the Next.js router tree untouched, and HourlyForecast the largest child at 8 ms." width="640"/>
    <figcaption>Switching locations costs one 27.6 ms commit, scoped to AppShell with the router tree untouched.</figcaption>
  </figure>
- [x] The application shall target a Lighthouse Accessibility score of 95+.
  - The zero-violation axe gate in CI covers the same rule set.
  <figure>
    <img src="docs/images/lighthouse-accessibility.png" alt="Lighthouse report with the Accessibility category expanded, showing a score of 100." width="480"/>
    <figcaption>Lighthouse Accessibility score of 100.</figcaption>
  </figure>
- [x] The application shall function as a website and a Progressive Web App (PWA).
  - Installable via `src/app/manifest.ts` (standalone display), with `public/sw.js` for offline, registered by `src/components/ServiceWorker/ServiceWorker.tsx`.
- [x] The CI/CD pipeline shall automatically execute linting, testing, and build validation before deployment.
  - The deploy jobs in `.github/workflows/ci.yml` declare `needs: [verify, e2e, lighthouse]`, so Prettier, ESLint, unit tests with coverage, Playwright, and Lighthouse gate every deployment.
- [x] The application shall support runtime feature flags.
  - `isEnabled` in `src/lib/flags.ts` reads the Cloudflare Flagship `FLAGS` binding server-side. The Share feature is flag-gated end to end (`src/app/page.tsx`).
- [x] The system shall provide unique metadata for each weather location page, including page title, description, and Open Graph tags.
  - `generateMetadata` in `src/app/page.tsx` gives shared-location URLs a unique title and Open Graph image on top of the site-wide metadata in `src/app/layout.tsx`.
- [x] BFF route handlers shall validate and sanitize inputs and apply rate limiting.
  - Every parameterized route Zod-parses its query (`src/lib/schemas/`) and runs the per-IP fixed-window limiter first (`src/lib/api/rate-limit.ts`, bound to Workers KV in `src/lib/api/bindings.ts`, failing open).
- [x] Upstream API responses shall be validated against a runtime schema (e.g. Zod) at the BFF boundary.
  - Open-Meteo and Nominatim responses are parsed with Zod schemas (`src/lib/schemas/weather.ts`, `search.ts`, `reverse.ts`) inside `src/lib/api/provider.ts` before being shaped into the app contract (`src/lib/api/transform.ts`).
- [x] Weather responses shall be cached with a stale-while-revalidate strategy aligned to the ≤5-minute refresh interval.
  - `public, s-maxage=300, stale-while-revalidate=600` on weather and a 1-day plus 7-day policy on search (`src/lib/api/http.ts`).
- [x] Preferences shall persist client-side via LocalStorage.
  - Zustand `persist` with a versioned, merge-safe store (`src/store/preferences.ts`).
- [x] Automated testing shall include end-to-end tests (e.g. Playwright) and automated accessibility checks (e.g. axe), with network requests mocked via MSW.
  - Playwright journeys plus an axe scan run in CI (`src/e2e/app.spec.ts`). MSW mocks the network for unit and integration tests (`src/tests/msw.ts`), and the E2E suite mocks API routes with Playwright route interception.
- [x] Dynamic content updates shall be announced to assistive technology via ARIA live regions.
  - A visually hidden polite live region announces weather loads and updates, the offline banner uses `role="status"`, and error states use `role="alert"` (`AppShell.tsx`, `SearchBar.tsx`).
- [x] The repository shall include a README with setup instructions and documented key decisions and trade-offs.
  - This README: setup under [Getting started](#getting-started), decisions under [Key decisions & trade-offs](#key-decisions--trade-offs).

#### Could have

- [x] The application shall respect the prefers-reduced-motion user preference.
  - A shared mixin gates animations and transitions behind `prefers-reduced-motion` (`src/styles/_mixins.scss`), and the E2E suite runs with it emulated.
- [x] Feature flags shall be managed through Cloudflare Flags.
  - Flagship bindings are configured per environment in `wrangler.jsonc`, so flags flip in the Cloudflare dashboard without a redeploy.
- [x] Location pages shall include JSON-LD structured data.
  - A `schema-dts`-typed `WebApplication` JSON-LD block in `src/app/layout.tsx`.
- [x] The system shall generate and expose a sitemap and robots.txt file.
  - Static metadata routes `src/app/robots.ts` and `src/app/sitemap.ts`, served at `/robots.txt` and `/sitemap.xml`. Robots allows all crawlers and points at the sitemap, which lists the dashboard with the canonical `SITE_URL` from `src/lib/site.ts`.
- [x] A performance budget shall be enforced in CI (e.g. Lighthouse CI) with explicit Core Web Vitals targets (LCP, CLS, INP).
  - A `lighthouse` job runs Lighthouse CI on every push and PR (`.github/workflows/ci.yml`), checking budgets defined in `lighthouserc.json` against the median of 3 runs. An Accessibility score below 95 fails the pipeline. Core Web Vitals targets (LCP ≤ 2.5s, CLS ≤ 0.1, TBT ≤ 300ms as a lab proxy for INP, and FCP ≤ 2s) trigger warnings rather than failures, since performance on shared CI runners is too noisy to use as a blocker. The HTML reports are saved as build artifacts.
- [x] Page analytics shall be collected using Cloudflare Zaraz and displayed on an Amplitude dashboard.
  - Configured at the edge. Cloudflare Zaraz injects the Amplitude tool on the deployed zone, so no analytics SDK ships in the client bundle and no tracking code lives in this repo. Analytics land in a shared [Amplitude dashboard](https://app.eu.amplitude.com/analytics/share/528c36fcee6c4034a776759446b5f4f4).
- [x] Application errors shall be monitored using Sentry.
  - `@sentry/nextjs` captures errors across the browser, SSR, and the BFF: `src/instrumentation.ts` hooks server request errors, `src/instrumentation-client.ts` initializes the browser SDK, and the `src/app/error.tsx` / `src/app/global-error.tsx` boundaries report render errors. Browser events are proxied through a first-party `/monitoring` tunnel (`next.config.ts`) so ad blockers don't drop them.

### Won't have

- Airport search
- User authentication
- Multi-user synchronization
- Server-side database persistence
- Weather alerts or notifications
- Administrative dashboard
- Internationalization (i18n)
- Real-time updates via WebSockets

## With more time

- **Consent-gated analytics.** Cloudflare Zaraz to Amplitude pipeline currently loads with privacy-preserving defaults; the next step is an explicit consent banner so analytics only fire after opt-in, managed through Zaraz's built-in consent API.
- **Per-location SSR routes.** Promote selection from local state to `/location/[slug]` pages that server-render the first paint with unique metadata and JSON-LD per location, seeding SWR through `fallbackData`. This closes the single-route design's main trade-off (thin per-location SEO) and gives the sitemap real per-location URLs to list.
- **Durable Object instead of KV for rate limiting.** Swap the KV fixed window for a Durable Object or Cloudflare's native rate-limiting binding to get atomic counting under heavy concurrent load. The limiter's store interface was designed so this is a drop-in change.
- **Richer weather data.** An hourly temperature and precipitation chart, plus Open-Meteo's air-quality and historical APIs for AQI and context like "warmer than yesterday" on the current conditions.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, branch and commit conventions, and the checks to run before opening a PR.

## Acknowledgements

- Weather and geocoding data by [Open-Meteo](https://open-meteo.com/) (CC BY 4.0).
- Postcode lookups via [Nominatim](https://nominatim.org/) and OpenStreetMap contributors.
- Weather condition icons self-hosted from the Airycons icon set shared in [open-meteo/open-meteo#789](https://github.com/open-meteo/open-meteo/issues/789).

## License

[MIT](LICENSE). Third-party data and assets (Open-Meteo data, Nominatim results, and the weather icons) remain under their own licenses, credited above.
