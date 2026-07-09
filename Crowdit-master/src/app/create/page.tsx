'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppModePanel } from '@/components/app-mode-panel';
import { CreateCampaignPreview } from '@/components/create-campaign-preview';
import { useCreateCampaign } from '@/hooks/use-create-campaign';
import { useWallet } from '@/hooks/use-wallet';
import { LoadingOverlay } from '@/components/loading-overlay';
import { TransactionStatus } from '@/components/transaction-status';
import { fromDateInputValue, toDateInputValue } from '@/lib/format';
import type { CampaignFormValues, TransactionState } from '@/types';

const initialValues: CampaignFormValues = {
  title: '',
  description: '',
  goal: 0,
  deadline: '',
};
const DRAFT_KEY = 'crowdit:create-campaign-draft';

export default function CreateCampaignPage(): JSX.Element {
  const router = useRouter();
  const { session } = useWallet();
  const createMutation = useCreateCampaign(session?.address ?? null);
  const [values, setValues] = useState<CampaignFormValues>(initialValues);
  const [txState, setTxState] = useState<TransactionState>({ status: 'idle' });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = window.localStorage.getItem(DRAFT_KEY);
    if (!stored) {
      return;
    }

    try {
      setValues(JSON.parse(stored) as CampaignFormValues);
    } catch {
      window.localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
  }, [values]);

  return (
    <div className="space-y-8">
      <AppModePanel />
      <section className="surface-dark p-6 sm:p-8">
        <p className="eyebrow text-violet-200">Campaign workshop</p>
        <h1 className="mt-3 font-display text-5xl leading-none text-white">Write a brief people can understand in one pass.</h1>
        <p className="mt-4 text-sm leading-7 text-white/70">
          The strongest campaigns name the ask clearly, explain why now matters, and set a closeout moment people can rally around.
        </p>
        <div className="mt-6 space-y-4 border border-white/10 bg-white/6 p-5">
          <div>
            <p className="text-sm font-semibold text-white">Lead with the need</p>
            <p className="mt-1 text-sm leading-6 text-white/62">
              Use the title to make the funding purpose instantly obvious.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Explain the unlock</p>
            <p className="mt-1 text-sm leading-6 text-white/62">
              Tell supporters what changes if the goal is met.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Choose the window</p>
            <p className="mt-1 text-sm leading-6 text-white/62">
              A deadline should create urgency without feeling arbitrary.
            </p>
          </div>
        </div>
      </section>
      <section className="glass-panel relative p-6 sm:p-8">
        {createMutation.isPending ? <LoadingOverlay label="Creating campaign..." /> : null}
        <p className="eyebrow text-smoke">Launch a campaign</p>
        <h2 className="mt-3 font-display text-5xl leading-none text-ink">Create your Crowdit page</h2>
        <p className="mt-4 text-base leading-8 text-smoke">
          Build the live brief, set the funding threshold, and define the moment this window closes.
        </p>
        {!session?.address ? (
          <div className="mt-6 rounded-[26px] border border-violet/20 bg-violet/8 p-4 text-sm text-violetDeep">
            Connect a wallet first so the campaign can be created under your Stellar address.
          </div>
        ) : null}
        <form
          className="mt-8 space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();

            if (!session?.address) {
              setTxState({
                status: 'error',
                message: 'Connect a wallet before launching a campaign.',
              });
              return;
            }

            if (!values.title.trim() || !values.description.trim() || values.goal <= 0 || !values.deadline) {
              setTxState({
                status: 'error',
                message: 'Complete every required field before launching.',
              });
              return;
            }

            if (new Date(values.deadline).getTime() <= Date.now()) {
              setTxState({
                status: 'error',
                message: 'Choose a deadline in the future.',
              });
              return;
            }

            setTxState({
              status: 'pending',
              message: 'Processing transaction...',
            });

            try {
              const result = await createMutation.mutateAsync(values);
              if (typeof window !== 'undefined') {
                window.localStorage.removeItem(DRAFT_KEY);
              }
              setValues(initialValues);
              setTxState({
                status: 'success',
                message: 'Campaign created successfully.',
                hash: result.hash,
              });
              router.push(`/campaign/${result.campaign.id}`);
            } catch (error) {
              setTxState({
                status: 'error',
                message: error instanceof Error ? error.message : 'Unable to create campaign.',
              });
            }
          }}
        >
          <div>
            <label htmlFor="title" className="text-sm font-semibold text-ink">
              Campaign title
            </label>
            <input
              id="title"
              value={values.title}
              onChange={(event) =>
                setValues((current) => ({ ...current, title: event.target.value }))
              }
              className="mt-2 min-h-11 w-full rounded-[22px] border border-ink/10 bg-white px-4 py-3 text-base outline-none"
              placeholder="Late-night short film, local venue series, community tool..."
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="text-sm font-semibold text-ink">
              Description
            </label>
            <textarea
              id="description"
              value={values.description}
              onChange={(event) =>
                setValues((current) => ({ ...current, description: event.target.value }))
              }
              className="mt-2 min-h-40 w-full rounded-[22px] border border-ink/10 bg-white px-4 py-3 text-base outline-none"
              placeholder="Explain what you are making, why it matters now, and what this support unlocks."
              required
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="goal" className="text-sm font-semibold text-ink">
                Goal amount in XLM
              </label>
              <input
                id="goal"
                type="number"
                min="1"
                value={values.goal || ''}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    goal: Number(event.target.value),
                  }))
                }
                className="mt-2 min-h-11 w-full rounded-[22px] border border-ink/10 bg-white px-4 py-3 text-base outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="deadline" className="text-sm font-semibold text-ink">
                Deadline
              </label>
              <input
                id="deadline"
                type="date"
                value={toDateInputValue(values.deadline)}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    deadline: fromDateInputValue(event.target.value),
                  }))
                }
                className="mt-2 min-h-11 w-full rounded-[22px] border border-ink/10 bg-white px-4 py-3 text-base outline-none"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending || !session?.address}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-violet px-5 py-3 text-sm font-semibold text-white transition hover:bg-violetDeep disabled:cursor-not-allowed disabled:opacity-70"
          >
            {createMutation.isPending ? 'Processing transaction...' : 'Launch Campaign'}
          </button>
        </form>
        <TransactionStatus
          state={txState}
          onDismiss={() => setTxState({ status: 'idle' })}
        />
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-smoke">
          <span>Draft auto-saves in this browser.</span>
          <button
            type="button"
            onClick={() => {
              setValues(initialValues);
              if (typeof window !== 'undefined') {
                window.localStorage.removeItem(DRAFT_KEY);
              }
            }}
            className="rounded-full border border-ink/10 bg-white px-4 py-2 font-semibold text-ink transition hover:border-violet/45 hover:text-violet"
          >
            Clear draft
          </button>
        </div>
      </section>
      <CreateCampaignPreview values={values} />
    </div>
  );
}
