import { DEFAULT_THEME } from '../src/theme';
import { ThemeProvider } from 'styled-components';
import { render, RenderResult } from '@testing-library/react';
import LoadingDots from '../src/components/indicators/LoadingDots';

// ============================================
// Helper functions for LoadingDots component
// ============================================

const renderLoadingDots = (): RenderResult => {
  return render(
    <ThemeProvider theme={DEFAULT_THEME}>
      <LoadingDots />
    </ThemeProvider>
  );
};

// ============================================
// Test cases
// ============================================

test('LoadingDots component mounts and renders without error', async () => {
  const { container } = renderLoadingDots();
  expect(container.hasChildNodes()).toBeTruthy();
});