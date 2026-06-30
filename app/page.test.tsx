import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { ThemeProvider } from '@/providers/ThemeProvider';

import Page from './page';

test('renders the hero heading and theme toggle', () => {
  render(
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  );

  expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /toggle light and dark theme/i })).toBeInTheDocument();
});
