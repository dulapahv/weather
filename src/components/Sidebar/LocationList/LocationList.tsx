'use client';

import type { KeyboardEvent } from 'react';

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DotsSixVerticalIcon, MapPinIcon, MinusCircleIcon } from '@phosphor-icons/react/dist/ssr';

import { cityFromTimeZone, formatNowInZone } from '@/lib/datetime';
import { restrictToParentElement, restrictToVerticalAxis } from '@/lib/dnd-modifiers';
import { formatTemperature } from '@/lib/units';
import { resolveCondition } from '@/lib/weather-codes';
import { useNow } from '@/hooks/useNow';
import { useWeather, type Coordinates } from '@/hooks/useWeather';
import type { Units } from '@/store/preferences';

import styles from './LocationList.module.scss';

export interface DisplayLocation {
  id: string;
  name: string;
  label: string;
  latitude: number;
  longitude: number;
  pinned?: boolean;
}

interface Props {
  locations: DisplayLocation[];
  selectedId: string | null;
  units: Units;
  editMode: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onReorder: (from: number, to: number) => void;
}

export const LocationList = ({
  locations,
  selectedId,
  units,
  editMode,
  onSelect,
  onRemove,
  onReorder
}: Props) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const now = useNow();

  if (locations.length === 0) {
    return <p className={styles.empty}>No locations yet — search to add one.</p>;
  }

  const handleListArrowNav = (e: KeyboardEvent<HTMLUListElement>) => {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button'));
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (current === -1) return;
    e.preventDefault();
    const count = buttons.length;
    const next =
      e.key === 'ArrowDown'
        ? (current + 1) % count
        : e.key === 'ArrowUp'
          ? (current - 1 + count) % count
          : e.key === 'Home'
            ? 0
            : count - 1;
    buttons[next]?.focus();
  };

  if (!editMode) {
    return (
      <ul className={styles.list} onKeyDown={handleListArrowNav}>
        {locations.map(loc => (
          <SelectableRow
            key={loc.id}
            loc={loc}
            units={units}
            now={now}
            selected={loc.id === selectedId}
            onSelect={() => onSelect(loc.id)}
          />
        ))}
      </ul>
    );
  }

  const sortable = locations.filter(l => !l.pinned);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = sortable.findIndex(l => l.id === active.id);
    const to = sortable.findIndex(l => l.id === over.id);
    if (from >= 0 && to >= 0) onReorder(from, to);
  };

  return (
    <ul className={styles.list}>
      {locations
        .filter(l => l.pinned)
        .map(loc => (
          <li key={loc.id} className={styles.editRow}>
            <MapPinIcon className={styles.pinIcon} weight="fill" aria-hidden />
            <span className={styles.editName}>{loc.name || 'My Location'}</span>
          </li>
        ))}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortable.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {sortable.map(loc => (
            <SortableEditRow key={loc.id} loc={loc} onRemove={() => onRemove(loc.id)} />
          ))}
        </SortableContext>
      </DndContext>
    </ul>
  );
};

const SelectableRow = ({
  loc,
  units,
  now,
  selected,
  onSelect
}: {
  loc: DisplayLocation;
  units: Units;
  now: number;
  selected: boolean;
  onSelect: () => void;
}) => {
  const coords: Coordinates = {
    latitude: loc.latitude,
    longitude: loc.longitude
  };
  const { weather } = useWeather(coords, units);

  const condition = weather ? resolveCondition(weather.current.weatherCode) : null;
  const today = weather?.daily[0];
  const sub = loc.pinned
    ? 'My Location'
    : weather
      ? formatNowInZone(weather.location.timezone, units.clock !== '24h', now)
      : '';

  const name = loc.name || (weather ? cityFromTimeZone(weather.location.timezone) : '...');

  return (
    <li>
      <button
        type="button"
        className={selected ? `${styles.btn} ${styles.btnActive}` : styles.btn}
        onClick={onSelect}
        aria-current={selected ? 'true' : undefined}
      >
        <span className={styles.left}>
          <span className={styles.name}>{name}</span>
          {sub ? <span className={styles.sub}>{sub}</span> : null}
          {condition ? <span className={styles.status}>{condition.description}</span> : null}
        </span>

        {weather ? (
          <span className={styles.right}>
            <span className={styles.temp}>{formatTemperature(weather.current.temperature)}</span>
            {today ? (
              <span className={styles.hilo}>
                H:
                {formatTemperature(today.temperatureMax ?? weather.current.temperature)} L:
                {formatTemperature(today.temperatureMin ?? weather.current.temperature)}
              </span>
            ) : null}
          </span>
        ) : null}
      </button>
    </li>
  );
};

const SortableEditRow = ({ loc, onRemove }: { loc: DisplayLocation; onRemove: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: loc.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1
  };

  return (
    <li ref={setNodeRef} style={style} className={styles.editRow}>
      <button
        type="button"
        className={styles.minus}
        onClick={onRemove}
        aria-label={`Remove ${loc.name}`}
      >
        <MinusCircleIcon weight="fill" />
      </button>
      <span className={styles.editName}>{loc.name}</span>
      <button
        type="button"
        className={styles.handle}
        aria-label={`Reorder ${loc.name}`}
        {...attributes}
        {...listeners}
      >
        <DotsSixVerticalIcon weight="bold" />
      </button>
    </li>
  );
};
