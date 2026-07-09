'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { useBalance } from '@/hooks/use-balance';
import { useRewardBalance } from '@/hooks/use-reward-balance';
import { useWallet } from '@/hooks/use-wallet';
import { formatRelativeUpdate, formatXlm, truncateAddress } from '@/lib/format';

export function AccountMenu(): JSX.Element | null {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { session, disconnectWallet } = useWallet();
  const balanceQuery = useBalance(session?.address ?? null);
  const rewardBalanceQuery = useRewardBalance(session?.address ?? null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!session?.address) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex min-h-12 items-center gap-3 border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white"
        aria-expanded={isOpen}
        aria-label="Open account menu"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center border border-ink bg-ink text-white">
          <User size={16} />
        </span>
        <span>{truncateAddress(session.address)}</span>
        <ChevronDown size={16} className={`transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-80 border border-ink/10 bg-white p-0">
          <div className="border-b border-ink/10 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-smoke">
              Active wallet
            </p>
            <p className="mt-2 break-all text-sm font-semibold text-ink">{session.address}</p>
          </div>

          <div className="grid gap-0">
            <div className="border-b border-ink/10 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-smoke">
                Available XLM
              </p>
              <p className="mt-2 font-display text-2xl text-ink">
                {balanceQuery.isLoading ? 'Loading...' : formatXlm(balanceQuery.data ?? 0)}
              </p>
              <p className="mt-2 text-xs text-smoke">
                Last updated: {formatRelativeUpdate(balanceQuery.dataUpdatedAt)}
              </p>
            </div>

            <div className="border-b border-ink/10 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet/80">
                CRD reward line
              </p>
              <p className="mt-2 font-display text-2xl text-ink">
                {rewardBalanceQuery.isLoading
                  ? 'Loading...'
                  : `${(rewardBalanceQuery.data ?? 0).toFixed(2)} CRD`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              disconnectWallet();
              setIsOpen(false);
            }}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white"
          >
            <LogOut size={16} />
            Disconnect
          </button>
        </div>
      ) : null}
    </div>
  );
}
