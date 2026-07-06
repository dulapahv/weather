'use client';

import { useEffect } from 'react';

import { ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr';
import * as Sentry from '@sentry/nextjs';

import styles from './error.module.scss';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const ErrorPage = ({ error, reset }: ErrorPageProps) => {
  useEffect(() => {
    Sentry.captureException(error);
    console.error('Application error:', error);
  }, [error]);

  return (
    <main className={styles.wrap} role="alert">
      <h1 className={styles.title}>Something went wrong</h1>
      <p className={styles.text}>The app hit an unexpected error. Please try again.</p>
      <button type="button" className={styles.retry} onClick={reset}>
        <ArrowClockwiseIcon weight="bold" /> Try again
      </button>
      {error.digest ? <p className={styles.digest}>Error ID: {error.digest}</p> : null}
    </main>
  );
};

export default ErrorPage;
