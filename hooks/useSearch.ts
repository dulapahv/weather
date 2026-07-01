'use client';

import useSWR from 'swr';

import type { SearchResponse, SearchResult } from '@/lib/schemas/search';

import { useDebouncedValue } from './useDebouncedValue';

const MIN_QUERY_LENGTH = 2;

export function useSearch(query: string): {
  results: SearchResult[];
  isLoading: boolean;
  isActive: boolean;
  error?: Error;
} {
  const debounced = useDebouncedValue(query.trim(), 250);
  const key =
    debounced.length >= MIN_QUERY_LENGTH
      ? `/api/search?q=${encodeURIComponent(debounced)}&count=6`
      : null;

  const { data, error, isLoading } = useSWR<SearchResponse>(key);

  return {
    results: data?.results ?? [],
    isLoading: Boolean(key) && isLoading,
    isActive: Boolean(key),
    error: error as Error | undefined
  };
}
