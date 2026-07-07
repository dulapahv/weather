'use client';

import { useEffect, useState } from 'react';

export const useNow = (): number => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      timer = setTimeout(
        () => {
          setNow(Date.now());
          schedule();
        },
        60_000 - (Date.now() % 60_000)
      );
    };

    schedule();
    return () => clearTimeout(timer);
  }, []);

  return now;
};
