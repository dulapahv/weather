import { z } from 'zod';

import { usePreferences } from '@/store/preferences';

const themeSchema = z.enum(['light', 'dark', 'system']);

const unitsSchema = z.object({
  temperature: z.enum(['celsius', 'fahrenheit']),
  windSpeed: z.enum(['kmh', 'ms', 'mph', 'kn']),
  distance: z.enum(['km', 'mi']),
  pressure: z.enum(['hpa', 'inhg', 'mmhg']),
  precipitation: z.enum(['mm', 'inch']),
  clock: z.enum(['12h', '24h']).default('12h')
});

const savedLocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  label: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string().optional(),
  countryCode: z.string().optional()
});

const preferencesSchema = z.object({
  theme: themeSchema.optional(),
  units: unitsSchema,
  locations: z.array(savedLocationSchema)
});

export interface ImportResult {
  ok: boolean;
  theme?: string;
}

export function exportPreferences(theme: string): void {
  const { units, locations } = usePreferences.getState();
  const json = JSON.stringify({ theme, units, locations }, null, 2);
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'weather-preferences.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function importPreferencesFromText(text: string): ImportResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false };
  }
  const parsed = preferencesSchema.safeParse(data);
  if (!parsed.success) return { ok: false };
  usePreferences.setState({
    units: parsed.data.units,
    locations: parsed.data.locations
  });
  return { ok: true, theme: parsed.data.theme };
}

export async function importPreferencesFile(file: File): Promise<ImportResult> {
  return importPreferencesFromText(await file.text());
}
