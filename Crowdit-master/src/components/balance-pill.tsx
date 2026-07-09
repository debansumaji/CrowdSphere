'use client';

import { useBalance } from '@/hooks/use-balance';
import { formatXlm } from '@/lib/format';
import { LoadingSpinner } from '@/components/loading-spinner';
import { CachedAt } from '@/components/cached-at';

export function BalancePill({
  address,
}: {
  address: string | null;
}): JSX.Element | null {
  const balanceQuery = useBalance(address);

  if (!address) {
    return null;
  }

  if (balanceQuery.isLoading) {
    return (
      <div className="border border-white/20 bg-white/6 px-4 py-3">
        <LoadingSpinner label="Fetching balance..." size="sm" />
      </div>
    );
  }

  return (
    <div className="border border-white/20 bg-white/6 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">Wallet balance</p>
      <p className="mt-2 font-display text-xl text-white">
        {formatXlm(balanceQuery.data ?? 0)}
      </p>
      <div className="mt-2">
        <CachedAt updatedAt={balanceQuery.dataUpdatedAt} />
      </div>
    </div>
  );
}
