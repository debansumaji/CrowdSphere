'use client';

import { useQuery } from '@tanstack/react-query';
import { listCampaigns } from '@/lib/contract-client';

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: listCampaigns,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchInterval: 30_000,
  });
}
