import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { ThemeProvider } from '@/providers/ThemeProvider';

import { ThemeToggle } from './ThemeToggle';

test('exposes an accessible theme toggle button', () => {
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );

  expect(screen.getByRole('button', { name: /toggle light and dark theme/i })).toBeInTheDocument();
});
