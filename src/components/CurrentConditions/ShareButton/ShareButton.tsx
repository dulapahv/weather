'use client';

import { useState } from 'react';

import { CheckIcon, ExportIcon } from '@phosphor-icons/react/dist/ssr';

import styles from './ShareButton.module.scss';

interface Props {
  name: string;
  latitude: number;
  longitude: number;
}

export const ShareButton = ({ name, latitude, longitude }: Props) => {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const params = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      name
    });
    const url = `${window.location.origin}/?${params}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `${name} weather`, url });
        return;
      } catch {
        // User dismissed the share sheet so fall through to copying.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <button type="button" className={styles.share} onClick={share} aria-label={`Share ${name}`}>
      {copied ? <CheckIcon weight="bold" /> : <ExportIcon weight="bold" />}
      {copied ? 'Copied' : 'Share'}
    </button>
  );
};
