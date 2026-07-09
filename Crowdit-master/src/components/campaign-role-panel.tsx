import { formatDeadline, formatXlm } from '@/lib/format';

interface CampaignRolePanelProps {
  isCreator: boolean;
  contribution: number;
  deadlinePassed: boolean;
  canClaim: boolean;
  canRefund: boolean;
  deadline: string;
  claimed: boolean;
}

export function CampaignRolePanel({
  isCreator,
  contribution,
  deadlinePassed,
  canClaim,
  canRefund,
  deadline,
  claimed,
}: CampaignRolePanelProps): JSX.Element {
  return (
    <div className="mt-6 rounded-[28px] border border-ink/8 bg-paper p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-smoke">
        Your role
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm text-smoke">Position</p>
          <p className="mt-1 font-semibold text-ink">
            {isCreator ? 'Campaign creator' : contribution > 0 ? 'Backer' : 'Viewer'}
          </p>
        </div>
        <div>
          <p className="text-sm text-smoke">Your total support</p>
          <p className="mt-1 font-semibold text-ink">{formatXlm(contribution)}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-smoke">
        Deadline: {formatDeadline(deadline)}. {deadlinePassed
          ? 'This campaign has reached its deadline.'
          : 'Claim and refund actions unlock once the deadline passes.'}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {claimed ? (
          <span className="rounded-full bg-violet/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet">
            Funds claimed
          </span>
        ) : null}
        {canClaim ? (
          <span className="rounded-full bg-violet/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet">
            Claim available
          </span>
        ) : null}
        {canRefund ? (
          <span className="rounded-full bg-ink/8 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink">
            Refund available
          </span>
        ) : null}
        {!canClaim && !canRefund ? (
          <span className="rounded-full bg-ink/8 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-smoke">
            Waiting on campaign state
          </span>
        ) : null}
      </div>
    </div>
  );
}
