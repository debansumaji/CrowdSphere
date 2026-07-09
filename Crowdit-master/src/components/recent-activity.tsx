'use client';

import Link from 'next/link';
import { useCampaigns } from '@/hooks/use-campaigns';
import { formatXlm, truncateAddress } from '@/lib/format';

export function RecentActivity(): JSX.Element {
  const campaignsQuery = useCampaigns();

  if (campaignsQuery.isLoading) {
    return (
      <section className="glass-panel rounded-[30px] p-6">
        <div className="shimmer h-10 rounded-2xl bg-white/75" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="shimmer h-20 rounded-[24px] bg-white/75" />
          ))}
        </div>
      </section>
    );
  }

  const items = (campaignsQuery.data ?? [])
    .flatMap((campaign) =>
      campaign.backers.map((backer) => ({
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        address: backer.address,
        amount: backer.amount,
        timestamp: backer.timestamp,
      })),
    )
    .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
    .slice(0, 5);

  return (
    <section className="grid gap-0 border border-ink/10 lg:grid-cols-[0.72fr_1.28fr]">
      <div className="border-b border-ink/10 p-6 lg:border-b-0 lg:border-r">
        <p className="eyebrow text-smoke">Recent activity</p>
        <h3 className="mt-3 font-display text-4xl leading-tight text-ink">See who just pushed a campaign forward.</h3>
        <p className="mt-4 text-sm leading-7 text-smoke">
          Every new contribution shifts the tone of a campaign. This stream surfaces those support moves as they land.
        </p>
        <Link
          href="/campaigns"
          className="mt-6 inline-flex rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-violet/45 hover:text-violet"
        >
          See all campaigns
        </Link>
      </div>
      <div className="p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-smoke">Live contribution stream</p>
          <h3 className="mt-2 font-display text-3xl text-ink">Latest support across Crowdit</h3>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-[26px] border border-dashed border-ink/15 bg-white/60 p-5 text-sm text-smoke">
            Contributions will appear here as soon as supporters start backing campaigns.
          </div>
        ) : (
          items.map((item) => (
            <Link
              key={`${item.campaignId}-${item.address}-${item.timestamp}`}
              href={`/campaign/${item.campaignId}`}
              className="flex items-center justify-between gap-4 rounded-[26px] border border-ink/8 bg-white px-4 py-4 transition hover:border-violet/40 hover:shadow-soft"
            >
              <div>
                <p className="font-semibold text-ink">{truncateAddress(item.address)}</p>
                <p className="mt-1 text-sm text-smoke">
                  backed <span className="font-semibold text-ink">{item.campaignTitle}</span>
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-smoke/80">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>
              <p className="whitespace-nowrap font-semibold text-ink">{formatXlm(item.amount)}</p>
            </Link>
          ))
        )}
      </div>
      </div>
    </section>
  );
}
