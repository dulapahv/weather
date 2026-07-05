import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import type { WebApplication, WithContext } from 'schema-dts';

import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '@/lib/site';
import { ServiceWorker } from '@/components/ServiceWorker/ServiceWorker';
import { SWRProvider } from '@/providers/SWRProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

import './globals.scss';

const inter = Inter({
  subsets: ['latin'],
  weight: 'variable'
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
    url: SITE_URL,
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
  url: SITE_URL,
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
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider>
          <SWRProvider>{children}</SWRProvider>
        </ThemeProvider>
        <ServiceWorker />
      </body>
    </html>
  );
};

export default RootLayout;
