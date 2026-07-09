'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCampaign } from '@/hooks/use-campaign';
import { useWallet } from '@/hooks/use-wallet';
import { useBackCampaign } from '@/hooks/use-back-campaign';
import { useBalance } from '@/hooks/use-balance';
import { useClaimFunds } from '@/hooks/use-claim-funds';
import { useRefundCampaign } from '@/hooks/use-refund-campaign';
import { CachedAt } from '@/components/cached-at';
import { CampaignActionsPanel } from '@/components/campaign-actions-panel';
import { CampaignRolePanel } from '@/components/campaign-role-panel';
import { CampaignStateBanner } from '@/components/campaign-state-banner';
import { LiveCountdown } from '@/components/live-countdown';
import { LoadingSpinner } from '@/components/loading-spinner';
import { LoadingOverlay } from '@/components/loading-overlay';
import { ProgressBar } from '@/components/progress-bar';
import { SupportSuggestions } from '@/components/support-suggestions';
import { TransactionStatus } from '@/components/transaction-status';
import { useRealtimeEvents } from '@/hooks/use-realtime-events';
import {
  formatDeadline,
  formatXlm,
  getCampaignStatus,
  getRemainingToGoal,
  getUserContribution,
  truncateAddress,
} from '@/lib/format';
import type { TransactionState } from '@/types';

export default function CampaignDetailsPage(): JSX.Element {
  const params = useParams<{ id: string }>();
  const campaignId = Number(params.id);
  const campaignQuery = useCampaign(campaignId);
  const { session } = useWallet();
  const balanceQuery = useBalance(session?.address ?? null);
  const backMutation = useBackCampaign(session?.address ?? null);
  const claimMutation = useClaimFunds(session?.address ?? null);
  const refundMutation = useRefundCampaign(session?.address ?? null);
  const [amount, setAmount] = useState('25');
  const [txState, setTxState] = useState<TransactionState>({ status: 'idle' });

  useRealtimeEvents(Number.isFinite(campaignId) ? campaignId : undefined);

  const insufficientLabel = useMemo(() => {
    const numericAmount = Number(amount);
    const balance = balanceQuery.data ?? 0;

    if (!numericAmount || numericAmount <= balance) {
      return null;
    }

    return `Insufficient XLM balance. Required ${formatXlm(numericAmount)}, available ${formatXlm(balance)}.`;
  }, [amount, balanceQuery.data]);

  if (campaignQuery.isLoading) {
    return (
      <div className="glass-panel rounded-[34px] p-8">
        <div className="shimmer h-12 rounded-2xl bg-white/75" />
        <div className="mt-4 shimmer h-40 rounded-3xl bg-white/75" />
      </div>
    );
  }

  if (campaignQuery.isError || !campaignQuery.data) {
    return (
      <div className="rounded-[34px] border border-red-200 bg-red-50 p-8 text-red-700">
        Campaign not found or unavailable.
      </div>
    );
  }

  const campaign = campaignQuery.data;
  const status = getCampaignStatus(campaign);
  const isCreator = session?.address === campaign.creator;
  const deadlinePassed = new Date(campaign.deadline).getTime() <= Date.now();
  const contribution = getUserContribution(campaign, session?.address ?? null);
  const goalMet = campaign.raised >= campaign.goal;
  const remainingToGoal = getRemainingToGoal(campaign);
  const canBack = !deadlinePassed;
  const canClaim = isCreator && deadlinePassed && campaign.raised >= campaign.goal && !campaign.claimed;
  const canRefund =
    Boolean(session?.address) &&
    deadlinePassed &&
    campaign.raised < campaign.goal &&
    contribution > 0;

  return (
    <div className="space-y-8">
      <section className="grid gap-0 border border-ink/10 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="p-8 xl:border-r xl:border-ink/10 xl:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="border border-violet/15 bg-violet/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-violet">
              {status}
            </span>
            <CachedAt updatedAt={campaignQuery.dataUpdatedAt} />
          </div>
          <h1 className="mt-5 max-w-4xl font-display text-5xl leading-[0.92] text-ink lg:text-[5rem]">
            {campaign.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-smoke">
            {campaign.description}
          </p>
          <div className="mt-8">
            <ProgressBar raised={campaign.raised} goal={campaign.goal} large />
          </div>
        </div>
        <div className="surface-dark p-8 xl:p-10">
          <p className="eyebrow text-violet-200">Campaign readout</p>
          <div className="mt-5 grid gap-0 border border-white/10">
            <div className="grid grid-cols-2 gap-4 border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">Raised</p>
                <p className="mt-2 font-display text-3xl text-white">{formatXlm(campaign.raised)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">Goal</p>
                <p className="mt-2 font-display text-3xl text-white">{formatXlm(campaign.goal)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">Backers</p>
                <p className="mt-2 text-lg font-semibold text-white">{campaign.backers.length}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">Remaining</p>
                <p className="mt-2 text-lg font-semibold text-white">{formatXlm(remainingToGoal)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">Deadline</p>
                <p className="mt-2 text-sm font-semibold text-white">{formatDeadline(campaign.deadline)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">Countdown</p>
                <p className="mt-2 text-sm font-semibold text-white"><LiveCountdown deadline={campaign.deadline} /></p>
              </div>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/45">Creator</p>
              <p className="mt-2 text-sm font-semibold text-white">{truncateAddress(campaign.creator)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[0.84fr_1.16fr]">
        <aside className="surface-dark relative h-fit p-8 xl:sticky xl:top-28">
        {backMutation.isPending || claimMutation.isPending || refundMutation.isPending ? (
          <LoadingOverlay label="Updating campaign..." />
        ) : null}
        <p className="eyebrow text-violet-200">Support desk</p>
        <h2 className="mt-3 font-display text-4xl text-white">Back this campaign</h2>
        <p className="mt-3 text-sm leading-7 text-white/68">
          Enter an amount, check your wallet balance, and act from the same place the campaign state is being tracked.
        </p>
        <CampaignActionsPanel
          showConnectHint={!session?.address}
          canBack={canBack}
          canClaim={canClaim}
          canRefund={canRefund}
          isCreator={Boolean(isCreator)}
          deadlinePassed={deadlinePassed}
          goalMet={goalMet}
        />
        <label className="mt-6 block text-sm font-semibold text-white" htmlFor="amount">
          Amount in XLM
        </label>
        <input
          id="amount"
          type="number"
          min="1"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="mt-2 min-h-11 w-full rounded-[22px] border border-white/10 bg-white/8 px-4 py-3 text-base text-white outline-none"
        />
        <div className="mt-4 border border-white/10 bg-white/6 p-4">
          <p className="text-sm text-white/55">Your balance</p>
          {balanceQuery.isLoading ? (
            <div className="mt-2">
              <LoadingSpinner label="Loading balance..." size="sm" />
            </div>
          ) : (
            <p className="mt-2 font-display text-2xl text-white">{formatXlm(balanceQuery.data ?? 0)}</p>
          )}
        </div>
        {canBack ? (
          <SupportSuggestions
            remaining={remainingToGoal}
            onSelect={(value) => setAmount(String(value))}
          />
        ) : null}
        <button
          type="button"
          onClick={async () => {
            const numericAmount = Number(amount);

            if (!session?.address) {
              setTxState({
                status: 'error',
                message: 'Connect a wallet before backing a campaign.',
              });
              return;
            }

            if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
              setTxState({
                status: 'error',
                message: 'Enter a valid amount greater than zero.',
              });
              return;
            }

            if (insufficientLabel) {
              setTxState({ status: 'error', message: insufficientLabel });
              return;
            }

            const shouldContinue = window.confirm(
              `Confirm backing ${campaign.title} with ${formatXlm(numericAmount)}?`,
            );

            if (!shouldContinue) {
              setTxState({
                status: 'error',
                message: 'Transaction cancelled by user.',
              });
              return;
            }

            setTxState({
              status: 'pending',
              message: 'Processing transaction...',
            });

            try {
              const result = await backMutation.mutateAsync({
                campaignId: campaign.id,
                amount: numericAmount,
              });
              setAmount('25');
              setTxState({
                status: 'success',
                message: `Contribution confirmed in ${result.mode} mode.`,
                hash: result.hash,
              });
            } catch (error) {
              setTxState({
                status: 'error',
                message: error instanceof Error ? error.message : 'Unable to process transaction.',
              });
            }
          }}
          disabled={backMutation.isPending || !canBack}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-violet hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {backMutation.isPending
            ? 'Processing transaction...'
            : !canBack
              ? 'Campaign Closed'
              : 'Back This Campaign'}
        </button>
        <TransactionStatus
          state={txState}
          onDismiss={() => setTxState({ status: 'idle' })}
        />
        {(canClaim || canRefund) && (
          <div className="mt-5 space-y-3">
            {canClaim ? (
              <button
                type="button"
                onClick={async () => {
                  setTxState({
                    status: 'pending',
                    message: 'Processing transaction...',
                  });

                  try {
                    const result = await claimMutation.mutateAsync(campaign.id);
                    setTxState({
                      status: 'success',
                      message: `Funds claimed in ${result.mode} mode.`,
                      hash: result.hash,
                    });
                  } catch (error) {
                    setTxState({
                      status: 'error',
                      message: error instanceof Error ? error.message : 'Unable to claim funds.',
                    });
                  }
                }}
                disabled={claimMutation.isPending}
                className="inline-flex w-full items-center justify-center rounded-full border border-violet/20 bg-violet/10 px-5 py-3 text-sm font-semibold text-violet-100 transition hover:bg-violet/18 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {claimMutation.isPending ? 'Processing transaction...' : 'Claim Funds'}
              </button>
            ) : null}
            {canRefund ? (
              <button
                type="button"
                onClick={async () => {
                  setTxState({
                    status: 'pending',
                    message: 'Processing transaction...',
                  });

                  try {
                    const result = await refundMutation.mutateAsync(campaign.id);
                    setTxState({
                      status: 'success',
                      message: `Refund processed in ${result.mode} mode.`,
                      hash: result.hash,
                    });
                  } catch (error) {
                    setTxState({
                      status: 'error',
                      message: error instanceof Error ? error.message : 'Unable to process refund.',
                    });
                  }
                }}
                disabled={refundMutation.isPending}
                className="inline-flex w-full items-center justify-center rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:border-violet/45 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {refundMutation.isPending ? 'Processing transaction...' : 'Request Refund'}
              </button>
            ) : null}
          </div>
        )}
        </aside>

        <div className="space-y-8">
          <section className="border border-ink/10 p-8">
            <p className="eyebrow text-smoke">Campaign state</p>
            <CampaignStateBanner campaign={campaign} status={status} />
          </section>

          <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-8">
              <section className="border border-ink/10 p-8">
                <p className="eyebrow text-smoke">Role and permissions</p>
                <CampaignRolePanel
                  isCreator={Boolean(isCreator)}
                  contribution={contribution}
                  deadlinePassed={deadlinePassed}
                  canClaim={canClaim}
                  canRefund={canRefund}
                  deadline={campaign.deadline}
                  claimed={campaign.claimed}
                />
              </section>

              <section className="border border-ink/10 p-8">
                <p className="eyebrow text-smoke">Context</p>
                <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm text-smoke">Contribution model</dt>
                    <dd className="mt-2 font-semibold text-ink">
                      {goalMet ? 'Goal reached or above target' : 'Still collecting toward target'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-smoke">Settlement path</dt>
                    <dd className="mt-2 font-semibold text-ink">
                      {deadlinePassed
                        ? canClaim
                          ? 'Creator claim available'
                          : canRefund
                            ? 'Backer refund available'
                            : 'No pending account action'
                        : 'Actions unlock after deadline'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-smoke">Campaign mode</dt>
                    <dd className="mt-2 font-semibold text-ink">
                      {deadlinePassed ? 'Closed to new support' : 'Open to new support'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-smoke">Current momentum</dt>
                    <dd className="mt-2 font-semibold text-ink">
                      {campaign.backers.length === 0
                        ? 'Waiting for first contribution'
                        : `${campaign.backers.length} backer${campaign.backers.length === 1 ? '' : 's'} recorded`}
                    </dd>
                  </div>
                </dl>
              </section>
            </div>

            <section className="border border-ink/10 p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow text-smoke">Backer ledger</p>
                  <h2 className="mt-3 font-display text-3xl text-ink">Recent supporters</h2>
                </div>
              </div>
              <div className="mt-6 space-y-0 border border-ink/10">
                {campaign.backers.length === 0 ? (
                  <div className="p-5 text-sm text-smoke">
                    No contributions yet. Be the first to back this campaign.
                  </div>
                ) : (
                  campaign.backers.slice(0, 6).map((backer) => (
                    <div
                      key={`${backer.address}-${backer.timestamp}`}
                      className="flex items-center justify-between gap-4 border-b border-ink/10 px-5 py-4 last:border-b-0"
                    >
                      <div>
                        <p className="font-semibold text-ink">{truncateAddress(backer.address)}</p>
                        <p className="mt-1 text-sm text-smoke">
                          {new Date(backer.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <p className="whitespace-nowrap font-semibold text-ink">
                        {formatXlm(backer.amount)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </section>
        </div>
      </section>
    </div>
  );
}
