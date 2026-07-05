import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import type { WebApplication, WithContext } from 'schema-dts';

import { SITE_DESCRIPTION, SITE_TITLE } from '@/lib/site';
import { SWRProvider } from '@/providers/SWRProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

import './globals.scss';

const inter = Inter({
  subsets: ['latin'],
  weight: 'variable'
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_TITLE,
    template: '%s | Weather'
  },
  description: SITE_DESCRIPTION,
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
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: siteUrl,
    images: [{ url: '/api/og', width: 1200, height: 630 }]
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/api/og']
  }
};

const jsonLd: WithContext<WebApplication> = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Weather',
  description: SITE_DESCRIPTION,
  url: siteUrl,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <body>
        <ThemeProvider>
          <SWRProvider>{children}</SWRProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
