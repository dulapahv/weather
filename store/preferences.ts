import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  ClockFormat,
  DistanceUnit,
  PrecipitationUnit,
  PressureUnit,
  TemperatureUnit,
  WindSpeedUnit
} from '@/lib/units';

export interface SavedLocation {
  id: string;
  name: string;
  label: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  countryCode?: string;
}

export interface Units {
  temperature: TemperatureUnit;
  windSpeed: WindSpeedUnit;
  distance: DistanceUnit;
  pressure: PressureUnit;
  precipitation: PrecipitationUnit;
  clock: ClockFormat;
}

export const DEFAULT_UNITS: Units = {
  temperature: 'celsius',
  windSpeed: 'kmh',
  distance: 'km',
  pressure: 'hpa',
  precipitation: 'mm',
  clock: '12h'
};

interface PreferencesState {
  units: Units;
  locations: SavedLocation[];
  hasHydrated: boolean;
  setUnit: <K extends keyof Units>(key: K, value: Units[K]) => void;
  addLocation: (location: SavedLocation) => void;
  removeLocation: (id: string) => void;
  reorderLocations: (from: number, to: number) => void;
  resetDefaults: () => void;
  setHasHydrated: (value: boolean) => void;
}

// A no-op storage for SSR, where localStorage is unavailable.
const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

export const usePreferences = create<PreferencesState>()(
  persist(
    set => ({
      units: DEFAULT_UNITS,
      locations: [],
      hasHydrated: false,
      setUnit: (key, value) => set(s => ({ units: { ...s.units, [key]: value } })),
      addLocation: location =>
        set(s =>
          s.locations.some(l => l.id === location.id)
            ? s
            : { locations: [...s.locations, location] }
        ),
      removeLocation: id => set(s => ({ locations: s.locations.filter(l => l.id !== id) })),
      reorderLocations: (from, to) =>
        set(s => {
          const next = [...s.locations];
          const [moved] = next.splice(from, 1);
          if (moved) next.splice(to, 0, moved);
          return { locations: next };
        }),
      resetDefaults: () => set({ units: DEFAULT_UNITS, locations: [] }),
      setHasHydrated: value => set({ hasHydrated: value })
    }),
    {
      name: 'weather-prefs',
      version: 1,
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : noopStorage
      ),
      partialize: s => ({ units: s.units, locations: s.locations }),
      // The persisted state may be missing some keys
      // (e.g. if the user upgraded from an older version of the app), so merge with defaults.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PreferencesState>;
        return {
          ...current,
          ...p,
          units: { ...DEFAULT_UNITS, ...(p.units ?? {}) }
        };
      },
      onRehydrateStorage: () => state => state?.setHasHydrated(true)
    }
  )
);
