'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCampaign } from '@/lib/contract-client';
import type { CampaignFormValues } from '@/types';
import { useWallet } from '@/hooks/use-wallet';

export function useCreateCampaign(address: string | null) {
  const queryClient = useQueryClient();
  const { signTransaction } = useWallet();

  return useMutation({
    mutationFn: async (values: CampaignFormValues) => {
      if (!address) {
        throw new Error('Connect a wallet before launching a campaign.');
      }

      return createCampaign(values, address, signTransaction);
    },
    onSuccess: async ({ campaign }) => {
      await queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.setQueryData(['campaign', campaign.id], campaign);
    },
  });
}
