'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { BalancePill } from '@/components/balance-pill';
import { WalletButton } from '@/components/wallet-button';
import { useRewardBalance } from '@/hooks/use-reward-balance';
import { useWallet } from '@/hooks/use-wallet';

export function MobileNav(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const { session } = useWallet();
  const rewardBalanceQuery = useRewardBalance(session?.address ?? null);
  const navLinkClassName =
    'border-t border-white/10 px-4 py-4 text-left text-sm font-semibold text-white transition hover:bg-white hover:text-ink';

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center border border-ink/10 bg-white text-ink transition hover:bg-ink hover:text-white"
        aria-expanded={isOpen}
        aria-label="Toggle navigation menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/20"
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation menu"
          />
          <div className="surface-dark fixed inset-x-4 top-20 z-40 border border-ink p-0">
            <div className="border-b border-white/10 px-4 py-4">
              <p className="eyebrow text-violet-200">Quick access</p>
              <p className="mt-2 text-sm text-white/68">
                Jump between the live board, your publish flow, and wallet controls.
              </p>
            </div>
            <nav className="flex flex-col">
              <Link href="/campaigns" className={navLinkClassName} onClick={() => setIsOpen(false)}>
                Open board
              </Link>
              <Link href="/create" className={navLinkClassName} onClick={() => setIsOpen(false)}>
                Publish campaign
              </Link>
              {session ? (
                <Link href="/dashboard" className={navLinkClassName} onClick={() => setIsOpen(false)}>
                  Open control room
                </Link>
              ) : null}
            </nav>
            {session?.address ? (
              <div className="border-t border-white/10 p-4">
                <BalancePill address={session.address} />
                <div className="mt-4 border border-violet/20 bg-white/6 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-200/80">
                    Reward line
                  </p>
                  <p className="mt-2 font-display text-xl text-white">
                    {(rewardBalanceQuery.data ?? 0).toFixed(2)} CRD
                  </p>
                </div>
              </div>
            ) : null}
            <div className="border-t border-white/10 p-4">
              <WalletButton />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
