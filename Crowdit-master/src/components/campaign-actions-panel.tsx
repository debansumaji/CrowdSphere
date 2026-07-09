interface CampaignActionsPanelProps {
  showConnectHint: boolean;
  canBack: boolean;
  canClaim: boolean;
  canRefund: boolean;
  isCreator: boolean;
  deadlinePassed: boolean;
  goalMet: boolean;
}

export function CampaignActionsPanel({
  showConnectHint,
  canBack,
  canClaim,
  canRefund,
  isCreator,
  deadlinePassed,
  goalMet,
}: CampaignActionsPanelProps): JSX.Element {
  let message = 'Connect a wallet and choose an amount to support this campaign.';

  if (showConnectHint) {
    message = 'Connect a Stellar wallet to back this campaign or unlock creator/backer actions.';
  } else if (!canBack && !deadlinePassed && goalMet) {
    message = 'This campaign already met its goal, but supporters can still watch it through the deadline.';
  } else if (!canBack && deadlinePassed && !canClaim && !canRefund) {
    message = 'This campaign is no longer accepting support and there are no available actions for your account.';
  } else if (canClaim && isCreator) {
    message = 'You created this campaign and can now claim funds because the goal was met and the deadline passed.';
  } else if (canRefund) {
    message = 'Your contribution is eligible for refund because the campaign missed its goal after the deadline.';
  }

  return (
    <div className="mt-4 rounded-[24px] border border-white/10 bg-white/6 p-4 text-sm leading-7 text-white/72">
      {message}
    </div>
  );
}
