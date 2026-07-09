import type { Campaign } from '@/types';

export function truncateAddress(address: string): string {
  if (address.length < 11) {
    return address;
  }

  return `${address.slice(0, 4)}...${address.slice(-3)}`;
}

export function formatXlm(amount: number): string {
  return `${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} XLM`;
}

export function getProgress(raised: number, goal: number): number {
  if (goal <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((raised / goal) * 100));
}

export function getDaysRemaining(deadline: string): number {
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function formatDeadline(deadline: string): string {
  return new Date(deadline).toLocaleString();
}

export function formatCountdownLabel(deadline: string): string {
  const ms = new Date(deadline).getTime() - Date.now();

  if (ms <= 0) {
    return 'Ended';
  }

  const hours = Math.floor(ms / (1000 * 60 * 60));
  if (hours < 24) {
    return `${hours}h left`;
  }

  return `${getDaysRemaining(deadline)} days left`;
}

export function getCampaignStateSummary(campaign: Campaign): string {
  const status = getCampaignStatus(campaign);

  if (status === 'active') {
    return 'Campaign is live and still accepting support.';
  }

  if (status === 'funded' && !campaign.claimed) {
    return 'Goal reached. Funds can be claimed after the deadline.';
  }

  if (status === 'funded' && campaign.claimed) {
    return 'Goal reached and funds already claimed by the creator.';
  }

  return 'Campaign ended without reaching its goal. Eligible backers can request refunds.';
}

export function getUserContribution(campaign: Campaign, address: string | null): number {
  if (!address) {
    return 0;
  }

  return campaign.backers.reduce((sum, backer) => {
    return backer.address === address ? sum + backer.amount : sum;
  }, 0);
}

export function matchesCampaignSearch(campaign: Campaign, searchTerm: string): boolean {
  const normalized = searchTerm.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return [campaign.title, campaign.description, campaign.creator].some((field) =>
    field.toLowerCase().includes(normalized),
  );
}

export function getRemainingToGoal(campaign: Campaign): number {
  return Math.max(0, campaign.goal - campaign.raised);
}

export function getCampaignStatus(campaign: Campaign): 'active' | 'funded' | 'ended' {
  const isEnded = new Date(campaign.deadline).getTime() <= Date.now();

  if (isEnded) {
    return campaign.raised >= campaign.goal ? 'funded' : 'ended';
  }

  return campaign.raised >= campaign.goal ? 'funded' : 'active';
}

export function formatRelativeUpdate(updatedAt: number): string {
  if (!updatedAt) {
    return 'Just now';
  }

  const seconds = Math.max(0, Math.floor((Date.now() - updatedAt) / 1000));
  return `${seconds} second${seconds === 1 ? '' : 's'} ago`;
}

export function toDateInputValue(value: string): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

export function fromDateInputValue(value: string): string {
  if (!value) {
    return '';
  }

  return new Date(`${value}T23:59:59.000Z`).toISOString();
}
