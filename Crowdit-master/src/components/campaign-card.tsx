import Link from 'next/link';
import { LiveBadge } from '@/components/live-badge';
import { formatCountdownLabel, formatXlm, getCampaignStatus, truncateAddress } from '@/lib/format';
import type { Campaign, CampaignStatus } from '@/types';
import { ProgressBar } from '@/components/progress-bar';

const badgeStyles: Record<CampaignStatus, string> = {
  active: 'bg-violet/10 text-violet',
  funded: 'bg-ink text-white',
  ended: 'bg-ink/8 text-smoke',
};

export function CampaignCard({
  campaign,
}: {
  campaign: Campaign;
}): JSX.Element {
  const status = getCampaignStatus(campaign);
  const isEnded = status === 'ended';

  return (
    <article
      className={`fade-in relative flex h-full flex-col overflow-hidden border-t border-r border-ink/10 bg-white p-6 ${
        isEnded ? 'opacity-80 saturate-75' : ''
      }`}
    >
      {isEnded ? (
        <div className="pointer-events-none absolute inset-0 bg-paper/65" aria-hidden="true" />
      ) : null}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className={`inline-flex px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${badgeStyles[status]}`}>
            {status}
          </span>
          {campaign.claimed ? (
            <span className="ml-2 inline-flex border border-violet/15 bg-violet/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet">
              claimed
            </span>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <h3 className="font-display text-2xl text-ink">{campaign.title}</h3>
            {!isEnded ? <LiveBadge /> : null}
          </div>
        </div>
        <span className="border border-ink/8 px-3 py-1 text-xs font-medium text-smoke">
          {formatCountdownLabel(campaign.deadline)}
        </span>
      </div>
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-smoke">{campaign.description}</p>
      <div className="mt-6">
        <ProgressBar raised={campaign.raised} goal={campaign.goal} />
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-4 border border-ink/8 p-4 text-sm text-ink/80">
        <div>
          <dt className="text-smoke">Goal</dt>
          <dd className="mt-1 font-semibold">{formatXlm(campaign.goal)}</dd>
        </div>
        <div>
          <dt className="text-smoke">Raised</dt>
          <dd className="mt-1 font-semibold">{formatXlm(campaign.raised)}</dd>
        </div>
        <div>
          <dt className="text-smoke">Backers</dt>
          <dd className="mt-1 font-semibold">{campaign.backers.length}</dd>
        </div>
        <div>
          <dt className="text-smoke">Creator</dt>
          <dd className="mt-1 font-semibold">{truncateAddress(campaign.creator)}</dd>
        </div>
      </dl>
      <Link
        href={`/campaign/${campaign.id}`}
        className="relative mt-8 inline-flex min-h-11 items-center justify-center border border-ink bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-ink"
      >
        View Details
      </Link>
    </article>
  );
}
