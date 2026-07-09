'use client';

import { useCampaigns } from '@/hooks/use-campaigns';
import { useWallet } from '@/hooks/use-wallet';
import { getCampaignStatus, getUserContribution } from '@/lib/format';

export function useUserCampaigns() {
  const { session } = useWallet();
  const campaignsQuery = useCampaigns();
  const campaigns = campaignsQuery.data ?? [];
  const address = session?.address ?? null;

  const created = address
    ? campaigns.filter((campaign) => campaign.creator === address)
    : [];

  const backed = address
    ? campaigns.filter((campaign) => campaign.creator !== address && getUserContribution(campaign, address) > 0)
    : [];

  const claimable = created.filter((campaign) => {
    return getCampaignStatus(campaign) === 'funded' && !campaign.claimed;
  });

  const refundable = backed.filter((campaign) => {
    return getCampaignStatus(campaign) === 'ended' && getUserContribution(campaign, address) > 0;
  });

  return {
    address,
    campaignsQuery,
    created,
    backed,
    claimable,
    refundable,
  };
}
