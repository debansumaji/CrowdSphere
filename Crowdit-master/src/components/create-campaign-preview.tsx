import { appMode } from '@/lib/env';
import { formatDeadline, formatXlm } from '@/lib/format';
import type { CampaignFormValues } from '@/types';

export function CreateCampaignPreview({
  values,
}: {
  values: CampaignFormValues;
}): JSX.Element {
  const isReady =
    values.title.trim().length > 0 &&
    values.description.trim().length > 0 &&
    values.goal > 0 &&
    values.deadline.length > 0;

  return (
    <section className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
      <aside className="glass-panel rounded-[34px] p-8">
        <p className="eyebrow text-smoke">Launch notes</p>
        <h3 className="mt-3 font-display text-3xl leading-tight text-ink">Check whether the brief feels clear before you publish it.</h3>
        <div className="mt-6 space-y-3 text-sm text-smoke">
          <p>{values.title.trim() ? 'Ready' : 'Missing'}: clear campaign title</p>
          <p>{values.description.trim() ? 'Ready' : 'Missing'}: full project story</p>
          <p>{values.goal > 0 ? 'Ready' : 'Missing'}: goal amount in XLM</p>
          <p>{values.deadline ? 'Ready' : 'Missing'}: future deadline</p>
        </div>
        <div className="mt-6 rounded-[24px] border border-violet/12 bg-violet/6 p-4 text-sm text-smoke">
          Launch mode: {appMode}. Until a live contract id is configured, create/back/claim/refund flows use demo transaction state.
        </div>
      </aside>
      <aside className="surface-dark rounded-[34px] p-8">
        <p className="eyebrow text-violet-200">Live preview</p>
        <h2 className="mt-3 font-display text-4xl text-white">
          {values.title.trim() || 'Your campaign title'}
        </h2>
        <p className="mt-4 text-sm leading-7 text-white/70">
          {values.description.trim() ||
            'Describe what you are funding, why it matters, and what backers are helping unlock.'}
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
            <p className="text-sm text-white/45">Goal</p>
            <p className="mt-2 font-display text-2xl text-white">
              {values.goal > 0 ? formatXlm(values.goal) : '0.00 XLM'}
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
            <p className="text-sm text-white/45">Deadline</p>
            <p className="mt-2 font-semibold text-white">
              {values.deadline ? formatDeadline(values.deadline) : 'Choose a date'}
            </p>
          </div>
        </div>
        {!isReady ? (
          <p className="mt-5 text-sm text-white/55">
            Fill in every field to make this preview representative of the published campaign.
          </p>
        ) : null}
      </aside>
    </section>
  );
}
