import type { Metadata } from 'next';

import { isEnabled } from '@/lib/flags';
import type { SavedLocation } from '@/store/preferences';
import { AppShell } from '@/components/AppShell/AppShell';

type SearchParams = Promise<{ lat?: string; lon?: string; name?: string }>;

export const generateMetadata = async ({
  searchParams
}: {
  searchParams: SearchParams;
}): Promise<Metadata> => {
  const { lat, lon, name } = await searchParams;
  if (!lat || !lon || !name) return {};

  const query = new URLSearchParams({ lat, lon, name }).toString();
  const ogUrl = `/api/og?${query}`;

  return {
    title: `${name} — Weather`,
    openGraph: { images: [{ url: ogUrl, width: 1200, height: 630 }] },
    twitter: { images: [ogUrl] }
  };
};

const Page = async ({ searchParams }: { searchParams: SearchParams }) => {
  const shareEnabled = await isEnabled('share', true);

  const { lat, lon, name } = await searchParams;
  const latitude = Number(lat);
  const longitude = Number(lon);
  const sharedLocation: SavedLocation | null =
    name && Number.isFinite(latitude) && Number.isFinite(longitude)
      ? {
          id: `shared:${latitude},${longitude}`,
          name,
          label: name,
          latitude,
          longitude
        }
      : null;

  return <AppShell shareEnabled={shareEnabled} sharedLocation={sharedLocation} />;
};

export default Page;
