'use client';

import Link from 'next/link';
import { useCampaigns } from '@/hooks/use-campaigns';
import { formatXlm, getCampaignStatus } from '@/lib/format';

export function HomeHighlights(): JSX.Element {
  const campaignsQuery = useCampaigns();

  if (campaignsQuery.isLoading) {
    return (
      <section className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="shimmer h-36 rounded-[30px] bg-white/75" />
        ))}
      </section>
    );
  }

  const campaigns = campaignsQuery.data ?? [];
  const totalRaised = campaigns.reduce((sum, campaign) => sum + campaign.raised, 0);
  const activeCount = campaigns.filter((campaign) => getCampaignStatus(campaign) === 'active').length;
  const supporterCount = campaigns.reduce((sum, campaign) => sum + campaign.backers.length, 0);

  return (
    <section className="grid gap-0 border border-ink/10 lg:grid-cols-[1.15fr_0.85fr]">
      <article className="surface-dark p-7 lg:border-r lg:border-white/10">
        <p className="eyebrow text-violet-200">Live board totals</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Raised</p>
            <p className="mt-2 font-display text-4xl text-white">{formatXlm(totalRaised)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Active briefs</p>
            <p className="mt-2 font-display text-4xl text-white">{activeCount}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Backer entries</p>
            <p className="mt-2 font-display text-4xl text-white">{supporterCount}</p>
          </div>
        </div>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/68">
          A compact read on how much support is moving through the board right now, how many campaigns are still live, and how much crowd energy is already visible on-chain.
        </p>
      </article>
      <article className="p-7">
        <p className="eyebrow text-smoke">Read the room</p>
        <h3 className="mt-3 font-display text-3xl text-ink">Find momentum before it disappears into the feed.</h3>
        <p className="mt-3 text-sm leading-7 text-smoke">
          Use the live board to catch active funding windows, watch support stack up, and spot campaigns close to crossing the line.
        </p>
        <Link
          href="/campaigns"
          className="mt-6 inline-flex rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-violet/45 hover:text-violet"
        >
          Open the campaign board
        </Link>
      </article>
    </section>
  );
}
