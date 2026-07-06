'use client';

import { useEffect } from 'react';

import { ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr';
import * as Sentry from '@sentry/nextjs';

import styles from './error.module.scss';

import './globals.scss';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const GlobalError = ({ error, reset }: GlobalErrorProps) => {
  useEffect(() => {
    Sentry.captureException(error);
    console.error('Application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className={styles.wrap} role="alert">
          <h1 className={styles.title}>Something went wrong</h1>
          <p className={styles.text}>The app hit an unexpected error. Please try again.</p>
          <button type="button" className={styles.retry} onClick={reset}>
            <ArrowClockwiseIcon weight="bold" /> Try again
          </button>
          {error.digest ? <p className={styles.digest}>Error ID: {error.digest}</p> : null}
        </main>
      </body>
    </html>
  );
};

export default GlobalError;
