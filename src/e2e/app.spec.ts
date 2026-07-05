import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { geoResponse, reverseResponse, searchResponse, weatherResponse } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/geo', route => route.fulfill({ json: geoResponse }));
  await page.route('**/api/weather**', route => route.fulfill({ json: weatherResponse }));
  await page.route('**/api/search**', route => route.fulfill({ json: searchResponse }));
  await page.route('**/api/reverse**', route => route.fulfill({ json: reverseResponse }));
});

test('should render current conditions for the resolved location', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Bangkok' })).toBeVisible();
  await expect(page.getByText('25°').first()).toBeVisible();
  await expect(page.getByText('Partly cloudy').first()).toBeVisible();
});

test('should add a location and update the detail when searching', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Bangkok' })).toBeVisible();

  await page.getByRole('combobox', { name: /search/i }).fill('Lon');
  await page
    .getByRole('option', { name: /London/ })
    .first()
    .click();

  await expect(page.getByRole('heading', { name: /London/ })).toBeVisible();
});

test('should have no detectable accessibility violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Bangkok' })).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});
