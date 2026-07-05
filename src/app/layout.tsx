import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import { SWRProvider } from '@/providers/SWRProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

import './globals.scss';

const inter = Inter({
  subsets: ['latin'],
  weight: 'variable'
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const TITLE = 'Weather — current conditions & forecast';
const DESCRIPTION = 'Current conditions with hourly and 10-day forecasts for any city.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: TITLE,
    template: '%s | Weather'
  },
  description: DESCRIPTION,
  applicationName: 'Weather',
  keywords: [
    'weather',
    'forecast',
    'hourly forecast',
    '10-day forecast',
    'temperature',
    'conditions'
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Weather',
    title: TITLE,
    description: DESCRIPTION,
    url: siteUrl,
    images: [{ url: '/api/og', width: 1200, height: 630 }]
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/api/og']
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f7fb' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0f1a' }
  ]
};

const RootLayout = ({ children }: LayoutProps<'/'>) => {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SWRProvider>{children}</SWRProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
