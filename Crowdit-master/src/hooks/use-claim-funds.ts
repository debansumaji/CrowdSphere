'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { claimCampaignFunds } from '@/lib/contract-client';
import { useWallet } from '@/hooks/use-wallet';

export function useClaimFunds(address: string | null) {
  const queryClient = useQueryClient();
  const { signTransaction } = useWallet();

  return useMutation({
    mutationFn: async (campaignId: number) => {
      if (!address) {
        throw new Error('Connect the creator wallet before claiming funds.');
      }

      return claimCampaignFunds(campaignId, address, signTransaction);
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
