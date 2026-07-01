import { beforeEach, describe, expect, test } from 'vitest';

import { DEFAULT_UNITS, usePreferences, type SavedLocation } from './preferences';

const loc = (id: string, name = id): SavedLocation => ({
  id,
  name,
  label: name,
  latitude: 1,
  longitude: 2
});

beforeEach(() => {
  usePreferences.getState().resetDefaults();
});

describe('preferences store', () => {
  test('should start with default metric units and no saved locations', () => {
    const s = usePreferences.getState();
    expect(s.units).toEqual(DEFAULT_UNITS);
    expect(s.locations).toEqual([]);
  });

  test('should append and dedupe by id', () => {
    const { addLocation } = usePreferences.getState();
    addLocation(loc('1', 'London'));
    addLocation(loc('1', 'London'));
    addLocation(loc('2', 'Paris'));
    expect(usePreferences.getState().locations.map(l => l.id)).toEqual(['1', '2']);
  });

  test('should remove a location by id', () => {
    const { addLocation, removeLocation } = usePreferences.getState();
    addLocation(loc('1'));
    addLocation(loc('2'));
    removeLocation('1');
    expect(usePreferences.getState().locations.map(l => l.id)).toEqual(['2']);
  });

  test('should move an item from one index to another', () => {
    const { addLocation, reorderLocations } = usePreferences.getState();
    addLocation(loc('a'));
    addLocation(loc('b'));
    addLocation(loc('c'));
    reorderLocations(0, 2);
    expect(usePreferences.getState().locations.map(l => l.id)).toEqual(['b', 'c', 'a']);
  });

  test('should update a single unit preference', () => {
    usePreferences.getState().setUnit('temperature', 'fahrenheit');
    expect(usePreferences.getState().units.temperature).toBe('fahrenheit');
  });

  test('should clear locations and restore default units', () => {
    const s = usePreferences.getState();
    s.addLocation(loc('1'));
    s.setUnit('temperature', 'fahrenheit');
    s.resetDefaults();
    expect(usePreferences.getState().units).toEqual(DEFAULT_UNITS);
    expect(usePreferences.getState().locations).toEqual([]);
  });
});
