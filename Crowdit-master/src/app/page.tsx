import dynamic from 'next/dynamic';
import { CampaignSkeleton } from '@/components/campaign-skeleton';
import { Hero } from '@/components/hero';
import { HomeHighlights } from '@/components/home-highlights';
import { RecentActivity } from '@/components/recent-activity';

const manifesto = [
  'Campaign pages read like live operating notes, not storefront clutter.',
  'Support intent, totals, timing, and closeout paths sit in one continuous surface.',
  'Creators can publish quickly without flattening the story behind the ask.',
];

const CampaignGrid = dynamic(
  () => import('@/components/campaign-grid').then((mod) => mod.CampaignGrid),
  {
    loading: () => (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <CampaignSkeleton key={index} />
        ))}
      </div>
    ),
  },
);

export default function HomePage(): JSX.Element {
  return (
    <div className="space-y-8">
      <Hero />
      <section className="grid gap-0 border border-ink/10 lg:grid-cols-[0.74fr_1.26fr]">
        <div className="border-b border-ink/10 p-8 lg:border-b-0 lg:border-r">
          <p className="eyebrow text-smoke">Field note</p>
          <p className="mt-4 max-w-xl font-display text-3xl leading-tight text-ink">
            Crowdit is designed more like a running board for live ideas than a marketplace template.
          </p>
        </div>
        <div className="p-8">
          <p className="eyebrow text-violet/80">Manifesto</p>
          <div className="mt-5 grid gap-0 border border-violet/12">
            {manifesto.map((item, index) => (
              <div
                key={item}
                className="grid gap-4 border-b border-violet/12 px-5 py-5 md:grid-cols-[72px_1fr] last:border-b-0"
              >
                <span className="font-display text-2xl text-violet">{`0${index + 1}`}</span>
                <p className="text-sm leading-7 text-smoke">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <HomeHighlights />
      <section className="border border-ink/10 p-8">
        <div>
          <p className="eyebrow text-smoke">Featured campaigns</p>
          <h2 className="mt-3 font-display text-4xl leading-tight text-ink">The board’s strongest signals, pulled forward.</h2>
          <p className="mt-4 text-sm leading-7 text-smoke">
            These campaigns are the best places to start if you want to see how Crowdit frames progress, urgency, and audience response in one place.
          </p>
        </div>
      </section>
      <section className="space-y-5 border border-ink/10 p-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-smoke">Now scanning</p>
            <h2 className="mt-2 font-display text-4xl text-ink">Momentum worth backing</h2>
          </div>
        </div>
        <CampaignGrid featured />
      </section>
      <RecentActivity />
      <section className="border border-ink/10 p-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <h3 className="font-display text-2xl text-ink">Visible progress</h3>
            <p className="mt-2 text-sm leading-7 text-smoke">
              Goals, support totals, and countdown state stay legible without hunting through tabs or modals.
            </p>
          </div>
          <div>
            <h3 className="font-display text-2xl text-ink">Wallet-native actions</h3>
            <p className="mt-2 text-sm leading-7 text-smoke">
              Supporters sign from their wallet and get direct feedback while the campaign context stays in view.
            </p>
          </div>
          <div>
            <h3 className="font-display text-2xl text-ink">Clean closeout</h3>
            <p className="mt-2 text-sm leading-7 text-smoke">
              Claim and refund paths remain explicit after the funding window instead of fading into the background.
            </p>
          </div>
        </div>
      </section>
      <section className="surface-dark p-8">
        <p className="eyebrow text-violet-200">Built to stay readable</p>
        <h2 className="mt-4 font-display text-4xl leading-tight text-white">
          The point is not just funding. It is keeping the full state of a campaign easy to understand.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-white/68">
          Crowdit is structured so the brief, the support curve, and the final outcome all sit on the same visual plane. That makes the experience feel less like a listing site and more like a live campaign room.
        </p>
      </section>
    </div>
  );
}
