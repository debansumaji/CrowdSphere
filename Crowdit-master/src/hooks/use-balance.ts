'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBalance } from '@/lib/balance';

export function useBalance(address: string | null) {
  return useQuery({
    queryKey: ['balance', address],
    queryFn: () => fetchBalance(address ?? ''),
    enabled: Boolean(address),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}
