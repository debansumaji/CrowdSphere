'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { refundCampaignContribution } from '@/lib/contract-client';
import { useWallet } from '@/hooks/use-wallet';

export function useRefundCampaign(address: string | null) {
  const queryClient = useQueryClient();
  const { signTransaction } = useWallet();

  return useMutation({
    mutationFn: async (campaignId: number) => {
      if (!address) {
        throw new Error('Connect a wallet before requesting a refund.');
      }

      return refundCampaignContribution(campaignId, address, signTransaction);
    },
    onSuccess: async ({ campaign }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
        queryClient.invalidateQueries({ queryKey: ['balance'] }),
      ]);
      queryClient.setQueryData(['campaign', campaign.id], campaign);
    },
  });
}
