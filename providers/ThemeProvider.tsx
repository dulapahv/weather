"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: Props) {
  return (
    <NextThemesProvider
      disableTransitionOnChange
      scriptProps={{ "data-cfasync": "false" }}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
