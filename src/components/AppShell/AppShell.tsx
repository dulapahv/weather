'use client';

import { useEffect, useState } from 'react';

import {
  ArrowClockwiseIcon,
  CloudSunIcon,
  ListIcon,
  WifiSlashIcon
} from '@phosphor-icons/react/dist/ssr';

import { cityFromTimeZone } from '@/lib/datetime';
import type { SearchResult } from '@/lib/schemas/search';
import { formatTemperature } from '@/lib/units';
import { conditionFamily, resolveCondition } from '@/lib/weather-codes';
import { useGeolocation, type GeoSource } from '@/hooks/useGeolocation';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useWeather } from '@/hooks/useWeather';
import { usePreferences, type SavedLocation } from '@/store/preferences';
import { CurrentConditions } from '@/components/CurrentConditions/CurrentConditions';
import { HourlyForecast } from '@/components/HourlyForecast/HourlyForecast';
import { MetricGrid } from '@/components/MetricGrid/MetricGrid';
import type { DisplayLocation } from '@/components/Sidebar/LocationList/LocationList';
import { SettingsDialog } from '@/components/Sidebar/SettingsDialog/SettingsDialog';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { TenDayForecast } from '@/components/TenDayForecast/TenDayForecast';
import { WeatherSkeleton } from '@/components/WeatherSkeleton/WeatherSkeleton';

import styles from './AppShell.module.scss';

const CURRENT_ID = 'current';

const sourceNote = (source: GeoSource): string => {
  if (source === 'gps') return 'My location';
  if (source === 'ip') return 'Approximate location';
  return 'Default location';
};

interface AppShellProps {
  shareEnabled: boolean;
  sharedLocation?: SavedLocation | null;
}

export const AppShell = ({ shareEnabled, sharedLocation }: AppShellProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(sharedLocation?.id ?? CURRENT_ID);

  const units = usePreferences(s => s.units);
  const saved = usePreferences(s => s.locations);
  const addLocation = usePreferences(s => s.addLocation);
  const removeLocation = usePreferences(s => s.removeLocation);
  const reorderLocations = usePreferences(s => s.reorderLocations);

  const geo = useGeolocation();
  const online = useOnlineStatus();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const current: DisplayLocation | null = geo.location
    ? {
        id: CURRENT_ID,
        name: geo.location.label,
        label: geo.location.label,
        latitude: geo.location.latitude,
        longitude: geo.location.longitude,
        pinned: true
      }
    : null;

  const locations: DisplayLocation[] = [
    ...(current ? [current] : []),
    ...saved.map(l => ({
      id: l.id,
      name: l.name,
      label: l.label,
      latitude: l.latitude,
      longitude: l.longitude
    }))
  ];

  const selected = locations.find(l => l.id === selectedId) ?? current ?? locations[0] ?? null;

  const coords = selected ? { latitude: selected.latitude, longitude: selected.longitude } : null;
  const { weather, error } = useWeather(coords, units);

  // On mobile, picking a location dismisses the drawer.
  const handleSelect = (id: string) => {
    setSelectedId(id);
    setMenuOpen(false);
  };

  useEffect(() => {
    if (!sharedLocation) return;
    addLocation(sharedLocation);

    const url = new URL(window.location.href);
    url.searchParams.delete('lat');
    url.searchParams.delete('lon');
    url.searchParams.delete('name');
    window.history.replaceState(window.history.state, '', url);
  }, [sharedLocation, addLocation]);

  const handleSearchSelect = (r: SearchResult) => {
    addLocation({
      id: r.id,
      name: r.name,
      label: r.label,
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone,
      countryCode: r.countryCode
    });
    handleSelect(r.id);
  };

  const handleRemove = (id: string) => {
    removeLocation(id);
    if (selectedId === id) setSelectedId(CURRENT_ID);
  };

  const note =
    selected?.id === CURRENT_ID && geo.location ? sourceNote(geo.location.source) : undefined;

  const place = selected?.label || (weather ? cityFromTimeZone(weather.location.timezone) : '');

  const conditionTint = weather ? conditionFamily(weather.current.weatherCode) : null;

  const liveStatus =
    weather && selected
      ? `Weather for ${place}: ${formatTemperature(weather.current.temperature)}, ${resolveCondition(weather.current.weatherCode).description}`
      : error && !weather
        ? 'Weather data is unavailable.'
        : selected || geo.status === 'locating'
          ? 'Loading weather...'
          : '';

  return (
    <>
      {conditionTint ? (
        <div
          key={conditionTint}
          className={styles.atmosphere}
          data-condition={conditionTint}
          aria-hidden
        />
      ) : null}
      <a href="#main" className={styles.skipLink}>
        Skip to main content
      </a>
      <div className={styles.layout}>
        {isDesktop && collapsed ? (
          <button
            type="button"
            className={styles.expandBtn}
            onClick={() => setCollapsed(false)}
            title="Show locations panel"
            aria-label="Show locations panel"
          >
            <ListIcon weight="bold" />
          </button>
        ) : null}
        <Sidebar
          collapsed={isDesktop ? collapsed : false}
          onToggleCollapse={() => {
            if (isDesktop) setCollapsed(c => !c);
            else setMenuOpen(false);
          }}
          mobileOpen={menuOpen}
          hidden={isDesktop ? collapsed : !menuOpen}
          locations={locations}
          selectedId={selected?.id ?? null}
          units={units}
          editMode={editMode}
          onToggleEdit={() => setEditMode(e => !e)}
          onSelect={handleSelect}
          onSearchSelect={handleSearchSelect}
          onRemove={handleRemove}
          onReorder={reorderLocations}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        {menuOpen ? (
          <div className={styles.backdrop} onClick={() => setMenuOpen(false)} aria-hidden />
        ) : null}
        <main id="main" className={styles.detail}>
          <button
            type="button"
            className={styles.menuFab}
            onClick={() => setMenuOpen(true)}
            title="Open locations panel"
            aria-label="Open locations panel"
            aria-expanded={menuOpen}
          >
            <ListIcon weight="bold" />
          </button>

          <div className={styles.detailInner}>
            {weather && selected ? (
              <div className={styles.stack}>
                <CurrentConditions
                  weather={weather}
                  locationLabel={selected.label}
                  sourceNote={note}
                  shareEnabled={shareEnabled}
                />
                <HourlyForecast weather={weather} units={units} />
                <TenDayForecast weather={weather} />
                <MetricGrid weather={weather} units={units} />
              </div>
            ) : error && !weather ? (
              <ErrorState message={error.message} onRetry={() => geo.locate()} />
            ) : selected || geo.status === 'locating' ? (
              <WeatherSkeleton />
            ) : (
              <EmptyState />
            )}
          </div>
        </main>
      </div>
      <p className={styles.srStatus} role="status" aria-live="polite">
        {liveStatus}
      </p>

      {!online ? (
        <div className={styles.offlineBar} role="status">
          <WifiSlashIcon weight="bold" aria-hidden />
          You are offline. Weather data may be out of date.
        </div>
      ) : null}

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => {
  return (
    <div className={styles.state} role="alert">
      <p className={styles.stateText}>{message}</p>
      <button type="button" className={styles.retry} onClick={onRetry}>
        <ArrowClockwiseIcon weight="bold" /> Try again
      </button>
    </div>
  );
};

const EmptyState = () => {
  return (
    <div className={styles.state}>
      <CloudSunIcon className={styles.emptyMark} weight="duotone" aria-hidden />
      <p className={styles.stateText}>Search for a city or postcode to see its weather.</p>
    </div>
  );
};
