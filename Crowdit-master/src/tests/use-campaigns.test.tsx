import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { useCampaigns } from '@/hooks/use-campaigns';
import { renderWithQueryClient } from '@/tests/test-utils';
import { listCampaigns } from '@/lib/contract-client';

vi.mock('@/lib/contract-client', () => ({
  listCampaigns: vi.fn(),
}));

function CampaignsProbe(): JSX.Element {
  const campaignsQuery = useCampaigns();

  if (campaignsQuery.isLoading) {
    return <p>Loading...</p>;
  }

  return <p>{campaignsQuery.data?.[0]?.title}</p>;
}

describe('useCampaigns', () => {
  it('fetches campaign data from the contract client', async () => {
    vi.mocked(listCampaigns).mockResolvedValue([
      {
        id: 4,
        creator: 'GTEST',
        title: 'Contract-backed campaign',
        description: 'Loaded from contract client',
        goal: 500,
        raised: 100,
        deadline: new Date().toISOString(),
        claimed: false,
        backers: [],
      },
    ]);

    renderWithQueryClient(<CampaignsProbe />);

    await waitFor(() => {
      expect(screen.getByText('Contract-backed campaign')).toBeInTheDocument();
    });
  });
});
