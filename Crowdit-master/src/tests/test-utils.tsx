import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { WalletProvider } from '@/hooks/use-wallet';

export function renderWithQueryClient(ui: ReactElement) {
  Object.assign(window, { __CROWDIT_TEST_WALLET__: true });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <WalletProvider>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </WalletProvider>,
  );
}
