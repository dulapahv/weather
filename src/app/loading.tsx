import { WeatherSkeleton } from '@/components/WeatherSkeleton/WeatherSkeleton';

import styles from './loading.module.scss';

const Loading = () => {
  return (
    <main className={styles.wrap} aria-label="Loading">
      <WeatherSkeleton />
    </main>
  );
};

export default Loading;
