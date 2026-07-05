'use client';

import { useEffect, useState } from 'react';

export const useOnlineStatus = (): boolean => {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    let active = true;

    const confirm = () => {
      fetch('/manifest.webmanifest', { method: 'HEAD', cache: 'no-store' })
        .then(() => active && setOnline(true))
        .catch(() => active && setOnline(false));
    };

    const goOnline = () => setOnline(true);
    const goOffline = confirm;

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    confirm();

    return () => {
      active = false;
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return online;
};
