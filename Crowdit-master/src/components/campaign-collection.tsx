import type { Route } from 'next';
import { CampaignCard } from '@/components/campaign-card';
import { EmptyState } from '@/components/empty-state';
import type { Campaign } from '@/types';

export function CampaignCollection({
  eyebrow,
  title,
  description,
  campaigns,
  emptyTitle,
  emptyDescription,
  emptyCtaLabel,
  emptyCtaHref,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  campaigns: Campaign[];
  emptyTitle: string;
  emptyDescription: string;
  emptyCtaLabel?: string;
  emptyCtaHref?: Route;
}): JSX.Element {
  return (
    <section className="space-y-4">
      <div>
        <p className="eyebrow text-smoke">{eyebrow}</p>
        <h2 className="mt-2 font-display text-4xl text-ink">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-7 text-smoke">{description}</p> : null}
      </div>
      {campaigns.length === 0 ? (
        <EmptyState
          eyebrow={eyebrow}
          title={emptyTitle}
          description={emptyDescription}
          ctaLabel={emptyCtaLabel}
          ctaHref={emptyCtaHref}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </section>
  );
}
