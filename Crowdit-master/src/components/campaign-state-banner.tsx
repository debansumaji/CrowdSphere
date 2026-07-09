import { getCampaignStateSummary } from '@/lib/format';
import type { Campaign, CampaignStatus } from '@/types';

const stateStyles: Record<CampaignStatus, string> = {
  active: 'border-violet/18 bg-violet/8 text-violetDeep',
  funded: 'border-ink/12 bg-ink text-white',
  ended: 'border-ink/12 bg-paper text-ink',
};

export function CampaignStateBanner({
  campaign,
  status,
}: {
  campaign: Campaign;
  status: CampaignStatus;
}): JSX.Element {
  return (
    <div className={`mt-6 rounded-[28px] border p-5 ${stateStyles[status]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em]">Campaign state</p>
      <p className="mt-3 text-sm leading-7">{getCampaignStateSummary(campaign)}</p>
    </div>
  );
}
