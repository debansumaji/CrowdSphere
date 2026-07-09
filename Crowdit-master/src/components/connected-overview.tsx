'use client';

import Link from 'next/link';
import { useBalance } from '@/hooks/use-balance';
import { useCampaigns } from '@/hooks/use-campaigns';
import { useWallet } from '@/hooks/use-wallet';
import { formatXlm, getUserContribution, truncateAddress } from '@/lib/format';

export function ConnectedOverview(): JSX.Element | null {
  const { session } = useWallet();
  const campaignsQuery = useCampaigns();
  const balanceQuery = useBalance(session?.address ?? null);

  if (!session?.address) {
    return null;
  }

  const campaigns = campaignsQuery.data ?? [];
  const createdCount = campaigns.filter((campaign) => campaign.creator === session.address).length;
  const backedCount = campaigns.filter((campaign) => getUserContribution(campaign, session.address) > 0).length;
  const backedTotal = campaigns.reduce((sum, campaign) => {
    return sum + getUserContribution(campaign, session.address);
  }, 0);

  return (
    <section className="grid gap-0 border border-ink/10 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="p-8 lg:border-r lg:border-ink/10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-smoke">Account overview</p>
          <h2 className="mt-2 font-display text-3xl text-ink">
            Connected as {truncateAddress(session.address)}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-smoke">
            Keep the wallet, the campaigns you run, and the campaigns you support on one operational readout.
          </p>
        </div>
        <div className="panel-inset px-5 py-4 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet/70">
            Available balance
          </p>
          <p className="mt-2 font-display text-3xl text-ink">
            {balanceQuery.isLoading ? 'Loading...' : formatXlm(balanceQuery.data ?? 0)}
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-[24px] border border-ink/8 bg-white p-5">
          <p className="text-sm text-smoke">Campaigns created</p>
          <p className="mt-2 font-display text-3xl text-ink">{createdCount}</p>
        </article>
        <article className="rounded-[24px] border border-ink/8 bg-white p-5">
          <p className="text-sm text-smoke">Campaigns backed</p>
          <p className="mt-2 font-display text-3xl text-ink">{backedCount}</p>
        </article>
        <article className="rounded-[24px] border border-ink/8 bg-white p-5">
          <p className="text-sm text-smoke">Total supported</p>
          <p className="mt-2 font-display text-3xl text-ink">{formatXlm(backedTotal)}</p>
        </article>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/create"
          className="border border-ink bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-ink"
        >
          Launch another campaign
        </Link>
        <Link
          href="/campaigns"
          className="border border-ink/10 px-5 py-3 text-sm font-semibold text-ink transition hover:border-violet hover:text-violet"
        >
          Review campaigns
        </Link>
        <Link
          href="/dashboard"
          className="border border-ink/10 px-5 py-3 text-sm font-semibold text-ink transition hover:border-violet hover:text-violet"
        >
          Open dashboard
        </Link>
      </div>
      </div>
      <div className="surface-dark p-8">
        <p className="eyebrow text-violet-200">Wallet posture</p>
        <p className="mt-4 font-display text-3xl leading-tight text-white">
          Your wallet becomes the control point for publishing, backing, claiming, and refunding.
        </p>
        <p className="mt-4 text-sm leading-7 text-white/68">
          Crowdit does not hide critical actions behind a different workflow. If the contract state unlocks something for this address, it should be legible here first.
        </p>
      </div>
    </section>
  );
}
