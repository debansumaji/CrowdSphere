'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AppModePanel } from '@/components/app-mode-panel';
import { CampaignGrid } from '@/components/campaign-grid';
import { useWallet } from '@/hooks/use-wallet';
import type { CampaignStatus } from '@/types';

const filters: Array<{ label: string; value: 'all' | CampaignStatus }> = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Funded', value: 'funded' },
  { label: 'Ended', value: 'ended' },
];

export default function CampaignsPage(): JSX.Element {
  const [filter, setFilter] = useState<'all' | CampaignStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'deadline' | 'raised' | 'goal' | 'backers'>('deadline');
  const { session } = useWallet();

  return (
    <div className="space-y-8">
      <section className="border border-ink/10 p-6 sm:p-8">
        <p className="eyebrow text-smoke">Campaign board</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-ink">Read the whole room before you choose where to move.</h1>
        <p className="mt-4 text-sm leading-7 text-smoke">
          This board is optimized for scanning timing, pressure, and traction quickly. Open any campaign to inspect the brief, then step directly into support.
        </p>
      </section>
      <section className="surface-dark p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="eyebrow text-violet-200">Live campaign index</p>
            <h2 className="mt-3 font-display text-5xl leading-none text-white">Browse every Crowdit project</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
              Scan support velocity, compare deadlines, and move from discovery to action without losing the campaign narrative.
            </p>
          </div>
          <div className="border border-white/10 bg-white/6 p-5">
            <p className="eyebrow text-white/42">Filters</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {filters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    filter === item.value
                      ? 'bg-white text-ink'
                      : 'border border-white/10 bg-white/6 text-white hover:border-violet/45'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {session ? (
            <Link
              href="/create"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-violet hover:text-white"
            >
              Publish a campaign
            </Link>
          ) : (
            <span className="rounded-full border border-violet/25 bg-violet/12 px-4 py-2 text-sm font-semibold text-violet-100">
              Connect a wallet to publish your own brief
            </span>
          )}
        </div>
      </section>
      <section className="border border-ink/10 p-6 sm:p-8">
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <label className="block">
            <span className="text-sm font-semibold text-ink">Search campaigns</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by title, description, or creator"
              className="mt-2 min-h-11 w-full rounded-[22px] border border-ink/10 bg-white px-4 py-3 text-base outline-none"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink">Sort by</span>
            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value as 'deadline' | 'raised' | 'goal' | 'backers')
              }
              className="mt-2 min-h-11 w-full rounded-[22px] border border-ink/10 bg-white px-4 py-3 text-base outline-none"
            >
              <option value="deadline">Nearest deadline</option>
              <option value="raised">Most raised</option>
              <option value="goal">Highest goal</option>
              <option value="backers">Most backers</option>
            </select>
          </label>
        </div>
      </section>
      <section className="panel-inset p-6 sm:p-8">
        <p className="eyebrow text-violet/80">How to read it</p>
        <p className="mt-4 text-sm leading-7 text-smoke">
          Use deadline sorting to find urgency, raised sorting to find traction, and backer sorting to find campaigns that are already pulling a community around them.
        </p>
      </section>
      <AppModePanel />
      <CampaignGrid filter={filter} searchTerm={searchTerm} sortBy={sortBy} />
    </div>
  );
}
