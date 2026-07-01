'use client';

import { useCallback, useEffect, useState } from 'react';

export type GeoSource = 'gps' | 'ip' | 'default';

export interface GeoResult {
  latitude: number;
  longitude: number;
  label: string;
  source: GeoSource;
}

interface GeoState {
  status: 'locating' | 'ready' | 'error';
  location: GeoResult | null;
}

async function fetchApproxLocation(): Promise<GeoResult> {
  const res = await fetch('/api/geo');
  if (!res.ok) throw new Error('geo fallback failed');
  return (await res.json()) as GeoResult;
}

async function fetchReverseLabel(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(`/api/reverse?lat=${lat}&lon=${lon}`);
    if (!res.ok) return '';
    const data = (await res.json()) as { label?: string };
    return data.label ?? '';
  } catch {
    return '';
  }
}

// Browser geolocation with a graceful fallback.
// GPS permission -> Cloudflare IP estimate -> a sensible default city.
export function useGeolocation(auto = true) {
  const [state, setState] = useState<GeoState>({
    status: auto ? 'locating' : 'ready',
    location: null
  });

  const request = useCallback(() => {
    const approx = () =>
      fetchApproxLocation()
        .then(location => setState({ status: 'ready', location }))
        .catch(() => setState({ status: 'error', location: null }));

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      void approx();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setState({
          status: 'ready',
          location: { latitude, longitude, label: '', source: 'gps' }
        });
        void fetchReverseLabel(latitude, longitude).then(label => {
          if (!label) return;
          setState(s =>
            s.location?.source === 'gps' &&
            s.location.latitude === latitude &&
            s.location.longitude === longitude
              ? { ...s, location: { ...s.location, label } }
              : s
          );
        });
      },
      () => void approx(),
      { timeout: 8000, maximumAge: 10 * 60 * 1000 }
    );
  }, []);

  const locate = useCallback(() => {
    setState(s => ({ ...s, status: 'locating' }));
    request();
  }, [request]);

  useEffect(() => {
    if (auto) request();
  }, [auto, request]);

  return { ...state, locate };
}
