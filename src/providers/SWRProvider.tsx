'use client';

import { ReactNode } from 'react';

import { SWRConfig } from 'swr';

import { fetcher } from '@/lib/api/fetcher';

export const SWRProvider = ({ children }: { children: ReactNode }) => {
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
};
