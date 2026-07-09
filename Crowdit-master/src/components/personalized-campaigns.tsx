'use client';

import Link from 'next/link';
import { CampaignCard } from '@/components/campaign-card';
import { useCampaigns } from '@/hooks/use-campaigns';
import { useWallet } from '@/hooks/use-wallet';
import { getUserContribution } from '@/lib/format';

export function PersonalizedCampaigns(): JSX.Element | null {
  const { session } = useWallet();
  const campaignsQuery = useCampaigns();

  if (!session?.address) {
    return null;
  }

  const campaigns = campaignsQuery.data ?? [];
  const created = campaigns.filter((campaign) => campaign.creator === session.address).slice(0, 2);
  const backed = campaigns
    .filter((campaign) => campaign.creator !== session.address && getUserContribution(campaign, session.address) > 0)
    .slice(0, 2);

  if (created.length === 0 && backed.length === 0) {
    return null;
  }

  return (
    <section className="space-y-8">
      {created.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink/45">
                Your campaigns
              </p>
              <h2 className="mt-2 font-display text-3xl text-ink">Projects you launched</h2>
            </div>
            <Link
              href="/create"
              className="rounded-full border border-ink/10 bg-white/80 px-4 py-2 text-sm font-semibold text-ink transition hover:border-ink/30"
            >
              Create another
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {created.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>
      ) : null}

      {backed.length > 0 ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink/45">
              Your support
            </p>
            <h2 className="mt-2 font-display text-3xl text-ink">Campaigns you backed</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {backed.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
