'use client';

import { useQuery } from '@tanstack/react-query';
import { getRewardBalance, getRewardMetadata } from '@/lib/reward-token-client';
import { env } from '@/lib/env';

export function useRewardBalance(address: string | null) {
  return useQuery({
    queryKey: ['rewardBalance', address],
    queryFn: () => getRewardBalance(address ?? ''),
    enabled: Boolean(address && env.rewardTokenId),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchInterval: 60_000,
  });
}

export function useRewardMetadata() {
  return useQuery({
    queryKey: ['rewardMetadata'],
    queryFn: getRewardMetadata,
    enabled: Boolean(env.rewardTokenId),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });
}
