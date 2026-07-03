'use client';

import { useEffect, useRef, useState } from 'react';

import {
  CheckIcon,
  DotsThreeOutlineIcon,
  GearSixIcon,
  PencilSimpleIcon
} from '@phosphor-icons/react/dist/ssr';

import styles from './OptionsMenu.module.scss';

interface Props {
  editing: boolean;
  onToggleEdit: () => void;
  onOpenSettings: () => void;
}

export const OptionsMenu = ({ editing, onToggleEdit, onOpenSettings }: Props) => {
  const [open, setOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (editing) {
    return (
      <button
        type="button"
        aria-label="Done editing"
        className={styles.done}
        onClick={onToggleEdit}
      >
        <CheckIcon weight="bold" />
      </button>
    );
  }

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="List options"
        onClick={() => setOpen(o => !o)}
      >
        <DotsThreeOutlineIcon weight="fill" />
      </button>

      {open ? (
        <div className={styles.menu} role="menu">
          <button
            type="button"
            role="menuitem"
            className={styles.item}
            onClick={() => {
              setOpen(false);
              onToggleEdit();
            }}
          >
            <PencilSimpleIcon /> Edit list
          </button>
          <button
            type="button"
            role="menuitem"
            className={styles.item}
            onClick={() => {
              setOpen(false);
              onOpenSettings();
            }}
          >
            <GearSixIcon /> Settings
          </button>
        </div>
      ) : null}
    </div>
  );
};
