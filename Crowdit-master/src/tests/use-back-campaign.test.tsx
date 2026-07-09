import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useBackCampaign } from '@/hooks/use-back-campaign';
import { backCampaign } from '@/lib/contract-client';
import { renderWithQueryClient } from '@/tests/test-utils';

vi.mock('@/lib/contract-client', () => ({
  backCampaign: vi.fn(),
}));

function BackCampaignProbe(): JSX.Element {
  const mutation = useBackCampaign('GBACKER');

  return (
    <div>
      <button
        type="button"
        onClick={async () => {
          await mutation.mutateAsync({ campaignId: 1, amount: 42 });
        }}
      >
        Back
      </button>
      <p>{mutation.isSuccess ? 'success' : 'idle'}</p>
    </div>
  );
}

describe('useBackCampaign', () => {
  it('submits a mocked backing transaction', async () => {
    vi.mocked(backCampaign).mockResolvedValue({
      campaign: {
        id: 1,
        creator: 'GCREATOR',
        title: 'Crowdit Test',
        description: 'Mocked transaction test',
        goal: 100,
        raised: 42,
        deadline: new Date().toISOString(),
        claimed: false,
        backers: [],
      },
      hash: 'tx_test_hash',
      mode: 'demo',
    });

    const user = userEvent.setup();
    renderWithQueryClient(<BackCampaignProbe />);

    await user.click(screen.getByRole('button', { name: /back/i }));

    await waitFor(() => {
      expect(screen.getByText('success')).toBeInTheDocument();
    });
  });
});
