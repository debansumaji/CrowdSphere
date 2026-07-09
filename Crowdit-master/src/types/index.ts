export type WalletId = 'freighter';

export type CampaignStatus = 'active' | 'funded' | 'ended';

export interface BackerContribution {
  address: string;
  amount: number;
  timestamp: string;
}

export interface Campaign {
  id: number;
  creator: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  deadline: string;
  claimed: boolean;
  backers: BackerContribution[];
}

export interface CampaignFormValues {
  title: string;
  description: string;
  goal: number;
  deadline: string;
}

export interface TransactionState {
  status: 'idle' | 'pending' | 'success' | 'error';
  message?: string;
  hash?: string;
}

export interface WalletOption {
  id: WalletId;
  name: string;
  installUrl: string;
  description: string;
}

export interface WalletSession {
  address: string;
  walletId: WalletId;
}
