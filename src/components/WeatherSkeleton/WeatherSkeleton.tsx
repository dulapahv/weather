import styles from './WeatherSkeleton.module.scss';

export const WeatherSkeleton = () => {
  return (
    <div className={styles.card} aria-busy="true" aria-label="Loading weather">
      <div className={`${styles.skeleton} ${styles.skelHead}`} />
      <div className={`${styles.skeleton} ${styles.skelHero}`} />
      <div className={styles.skelGrid}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`${styles.skeleton} ${styles.skelMetric}`} />
        ))}
      </div>
    </div>
  );
};
