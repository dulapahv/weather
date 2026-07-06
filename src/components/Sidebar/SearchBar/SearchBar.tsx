'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';

import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr';

import type { SearchResult } from '@/lib/schemas/search';
import { useSearch } from '@/hooks/useSearch';

import styles from './SearchBar.module.scss';

interface Props {
  onSelect: (result: SearchResult) => void;
}

export const SearchBar = ({ onSelect }: Props) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const { results, isLoading, isActive } = useSearch(query);

  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);

  const blurTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showList = open && isActive;
  const showOptions = showList && results.length > 0;

  const move = (next: number) => {
    const n = results.length;
    if (n === 0) return;
    const wrapped = ((next % n) + n) % n;
    setActive(wrapped);
    listRef.current?.children[wrapped]?.scrollIntoView({ block: 'nearest' });
  };

  const choose = (result: SearchResult) => {
    onSelect(result);
    setQuery('');
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showOptions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      move(active + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      move(active - 1);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      move(active + (e.shiftKey ? -1 : 1));
    } else if (e.key === 'Enter' && active >= 0 && results[active]) {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.field}>
        <MagnifyingGlassIcon className={styles.searchIcon} weight="bold" aria-hidden />
        <input
          className={styles.input}
          type="text"
          role="combobox"
          aria-expanded={showOptions}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-opt-${active}` : undefined}
          placeholder="Search for a city, or postcode..."
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={onKeyDown}
        />
      </div>

      {showOptions ? (
        <ul className={styles.list} role="listbox" id={listId} ref={listRef}>
          {results.map((r, i) => (
            <li
              key={r.id}
              id={`${listId}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? `${styles.option} ${styles.optionActive}` : styles.option}
              onMouseDown={e => {
                e.preventDefault();
                choose(r);
              }}
              onMouseMove={() => {
                if (i !== active) setActive(i);
              }}
            >
              <span className={styles.optName}>{r.name}</span>
              <span className={styles.optRegion}>
                {[r.admin1, r.country].filter(Boolean).join(', ')}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {showList && results.length === 0 && !isLoading ? (
        <p className={styles.note} role="status">
          No matches
        </p>
      ) : null}
    </div>
  );
};
