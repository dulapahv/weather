'use client';

import { useState } from 'react';

const SentryTestPage = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('Sentry client test error — delete me');
  }

  return (
    <main style={{ display: 'flex', gap: '1rem', padding: '2rem' }}>
      <button type="button" onClick={() => setShouldThrow(true)}>
        Throw client error
      </button>
      <button type="button" onClick={() => fetch('/api/sentry-test')}>
        Trigger server error
      </button>
    </main>
  );
};

export default SentryTestPage;
