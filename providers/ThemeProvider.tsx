'use client';

import type { ComponentProps } from 'react';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

type Props = ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: Props) {
  return (
    <NextThemesProvider
      disableTransitionOnChange
      scriptProps={{ 'data-cfasync': 'false' }}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
