'use client';

import { useEffect, useRef } from 'react';

import { XIcon } from '@phosphor-icons/react/dist/ssr';
import { useTheme } from 'next-themes';

import { usePreferences } from '@/store/preferences';

import styles from './SettingsDialog.module.scss';

interface Props {
  open: boolean;
  onClose: () => void;
}

const UNIT_OPTIONS = {
  temperature: [
    ['celsius', '°C'],
    ['fahrenheit', '°F']
  ],
  windSpeed: [
    ['kmh', 'km/h'],
    ['ms', 'm/s'],
    ['mph', 'mph'],
    ['kn', 'kn']
  ],
  distance: [
    ['km', 'km'],
    ['mi', 'mi']
  ],
  pressure: [
    ['hpa', 'hPa'],
    ['inhg', 'inHg'],
    ['mmhg', 'mmHg']
  ],
  precipitation: [
    ['mm', 'mm'],
    ['inch', 'in']
  ],
  clock: [
    ['12h', '12-hour'],
    ['24h', '24-hour']
  ]
} as const;

const THEME_OPTIONS = [
  ['light', 'Light'],
  ['dark', 'Dark'],
  ['system', 'Auto']
] as const;

export const SettingsDialog = ({ open, onClose }: Props) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      onClose={onClose}
      onCancel={onClose}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {open ? <DialogBody onClose={onClose} /> : null}
    </dialog>
  );
};

const DialogBody = ({ onClose }: { onClose: () => void }) => {
  const units = usePreferences(s => s.units);
  const setUnit = usePreferences(s => s.setUnit);
  const resetDefaults = usePreferences(s => s.resetDefaults);
  const { theme, setTheme } = useTheme();

  return (
    <>
      <div className={styles.head}>
        <h2 className={styles.title}>Settings</h2>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close settings"
        >
          <XIcon weight="bold" />
        </button>
      </div>

      <div className={styles.body}>
        <Segment
          label="Temperature"
          options={UNIT_OPTIONS.temperature}
          value={units.temperature}
          onChange={v => setUnit('temperature', v)}
        />
        <Segment
          label="Wind speed"
          options={UNIT_OPTIONS.windSpeed}
          value={units.windSpeed}
          onChange={v => setUnit('windSpeed', v)}
        />
        <Segment
          label="Distance"
          options={UNIT_OPTIONS.distance}
          value={units.distance}
          onChange={v => setUnit('distance', v)}
        />
        <Segment
          label="Pressure"
          options={UNIT_OPTIONS.pressure}
          value={units.pressure}
          onChange={v => setUnit('pressure', v)}
        />
        <Segment
          label="Precipitation"
          options={UNIT_OPTIONS.precipitation}
          value={units.precipitation}
          onChange={v => setUnit('precipitation', v)}
        />
        <Segment
          label="Clock"
          options={UNIT_OPTIONS.clock}
          value={units.clock}
          onChange={v => setUnit('clock', v)}
        />
        <Segment
          label="Theme"
          options={THEME_OPTIONS}
          value={theme === 'light' || theme === 'dark' ? theme : 'system'}
          onChange={setTheme}
        />

        <div className={styles.data}>
          <button type="button" className={styles.action}>
            Export
          </button>
          <label className={styles.action}>
            Import
            <input type="file" accept="application/json" hidden />
          </label>
          <button type="button" className={styles.danger} onClick={resetDefaults}>
            Restore defaults
          </button>
        </div>
      </div>
    </>
  );
};

const Segment = <T extends string>({
  label,
  options,
  value,
  onChange
}: {
  label: string;
  options: readonly (readonly [T, string])[];
  value: T;
  onChange: (value: T) => void;
}) => {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <div className={styles.segment} role="group" aria-label={label}>
        {options.map(([val, lbl]) => (
          <button
            key={val}
            type="button"
            className={val === value ? `${styles.seg} ${styles.segActive}` : styles.seg}
            aria-pressed={val === value}
            onClick={() => onChange(val)}
          >
            {lbl}
          </button>
        ))}
      </div>
    </div>
  );
};
