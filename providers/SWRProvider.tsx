'use client';

import { SWRConfig } from 'swr';

import { fetcher } from '@/lib/api/fetcher';

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: true,
        errorRetryCount: 2,
        dedupingInterval: 5000
      }}
    >
      {children}
    </SWRConfig>
  );
}
