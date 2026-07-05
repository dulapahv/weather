'use client';

import { CaretLeftIcon } from '@phosphor-icons/react/dist/ssr';

import type { SearchResult } from '@/lib/schemas/search';
import type { Units } from '@/store/preferences';

import { LocationList, type DisplayLocation } from './LocationList/LocationList';
import { OptionsMenu } from './OptionsMenu/OptionsMenu';
import { SearchBar } from './SearchBar/SearchBar';
import styles from './Sidebar.module.scss';

interface Props {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  hidden: boolean;
  locations: DisplayLocation[];
  selectedId: string | null;
  units: Units;
  editMode: boolean;
  onToggleEdit: () => void;
  onSelect: (id: string) => void;
  onSearchSelect: (result: SearchResult) => void;
  onRemove: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  onOpenSettings: () => void;
}

export const Sidebar = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  hidden,
  locations,
  selectedId,
  units,
  editMode,
  onToggleEdit,
  onSelect,
  onSearchSelect,
  onRemove,
  onReorder,
  onOpenSettings
}: Props) => {
  return (
    <aside
      className={styles.sidebar}
      data-collapsed={collapsed || undefined}
      data-open={mobileOpen || undefined}
      inert={hidden || undefined}
      aria-label="Saved locations"
    >
      {collapsed ? null : (
        <>
          {editMode ? null : (
            <div className={styles.search}>
              <SearchBar onSelect={onSearchSelect} />
            </div>
          )}

          <nav className={styles.scroll} aria-label="Locations">
            <LocationList
              locations={locations}
              selectedId={selectedId}
              units={units}
              editMode={editMode}
              onSelect={onSelect}
              onRemove={onRemove}
              onReorder={onReorder}
            />
          </nav>

          <div className={styles.foot}>
            <OptionsMenu
              editing={editMode}
              onToggleEdit={onToggleEdit}
              onOpenSettings={onOpenSettings}
            />

            <button
              type="button"
              className={styles.collapseBtn}
              onClick={onToggleCollapse}
              aria-label={mobileOpen ? 'Close locations panel' : 'Collapse panel'}
              title={mobileOpen ? 'Close locations panel' : 'Collapse panel'}
            >
              <CaretLeftIcon weight="bold" />
            </button>
          </div>
        </>
      )}
    </aside>
  );
};
