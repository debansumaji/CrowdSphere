'use client';

import { useQuery } from '@tanstack/react-query';
import { getCampaign } from '@/lib/contract-client';

export function useCampaign(campaignId: number) {
  return useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => getCampaign(campaignId),
    enabled: Number.isFinite(campaignId),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchInterval: 10_000,
  });
}
