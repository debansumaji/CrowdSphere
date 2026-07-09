import {
  backDemoCampaign,
  claimDemoCampaign,
  createDemoCampaign,
  readCampaigns,
  refundDemoCampaign,
} from '@/lib/demo-store';
import { env } from '@/lib/env';
import {
  createAddressArg,
  createI128Arg,
  createStringArg,
  createU32Arg,
  createU64Arg,
  fromI128Amount,
  simulateContractCall,
  submitContractTransaction,
  type WalletTransactionSigner,
} from '@/lib/soroban';
import type { Campaign, CampaignFormValues } from '@/types';

function createMockHash(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 15)}`;
}

export function getCampaignOperationMode(): 'contract' | 'demo' {
  return env.contractId ? 'contract' : 'demo';
}

export async function listCampaigns(): Promise<Campaign[]> {
  if (getCampaignOperationMode() === 'contract') {
    const count = Number(await simulateContractCall<number>('get_campaign_count', []));
    const campaigns = await Promise.all(
      Array.from({ length: count }, async (_, index) => {
        const campaignId = index + 1;

        try {
          return await getContractCampaign(campaignId);
        } catch {
          return null;
        }
      }),
    );

    return campaigns.filter((campaign): campaign is Campaign => campaign !== null);
  }

  return readCampaigns();
}

export async function getCampaign(campaignId: number): Promise<Campaign> {
  if (getCampaignOperationMode() === 'contract') {
    return getContractCampaign(campaignId);
  }

  const campaigns = readCampaigns();
  const campaign = campaigns.find((item) => item.id === campaignId);

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  return campaign;
}

export async function createCampaign(
  values: CampaignFormValues,
  creator: string,
  signTransaction?: WalletTransactionSigner,
): Promise<{ campaign: Campaign; hash: string; mode: 'contract' | 'demo' }> {
  if (getCampaignOperationMode() === 'contract') {
    if (!signTransaction) {
      throw new Error('Connect a wallet before submitting a contract transaction.');
    }

    const result = await submitContractTransaction<number>(
      'create_campaign',
      creator,
      [
        createAddressArg(creator),
        createStringArg(values.title.trim()),
        createStringArg(values.description.trim()),
        createI128Arg(values.goal),
        createU64Arg(Math.floor(new Date(values.deadline).getTime() / 1000)),
      ],
      signTransaction,
    );
    const campaignId = Number(result.returnValue);
    const campaign = await getContractCampaign(campaignId);

    return {
      campaign,
      hash: result.hash,
      mode: 'contract',
    };
  }

  const campaign = createDemoCampaign(values, creator);
  return {
    campaign,
    hash: createMockHash('create'),
    mode: getCampaignOperationMode(),
  };
}

export async function backCampaign(
  campaignId: number,
  address: string,
  amount: number,
  signTransaction?: WalletTransactionSigner,
): Promise<{ campaign: Campaign; hash: string; mode: 'contract' | 'demo' }> {
  if (getCampaignOperationMode() === 'contract') {
    if (!signTransaction) {
      throw new Error('Connect a wallet before submitting a contract transaction.');
    }

    const result = await submitContractTransaction(
      'back_campaign',
      address,
      [
        createU32Arg(campaignId),
        createAddressArg(address),
        createI128Arg(amount),
      ],
      signTransaction,
    );
    const campaign = await getContractCampaign(campaignId);

    return {
      campaign,
      hash: result.hash,
      mode: 'contract',
    };
  }

  const campaign = backDemoCampaign(campaignId, address, amount);
  return {
    campaign,
    hash: createMockHash('back'),
    mode: getCampaignOperationMode(),
  };
}

export async function claimCampaignFunds(
  campaignId: number,
  creator?: string,
  signTransaction?: WalletTransactionSigner,
): Promise<{ campaign: Campaign; hash: string; mode: 'contract' | 'demo' }> {
  const campaign = await getCampaign(campaignId);

  if (new Date(campaign.deadline).getTime() > Date.now()) {
    throw new Error('Funds can only be claimed after the deadline.');
  }

  if (campaign.raised < campaign.goal) {
    throw new Error('Campaign goal has not been met.');
  }

  if (getCampaignOperationMode() === 'contract') {
    if (!creator || !signTransaction) {
      throw new Error('Connect the creator wallet before claiming campaign funds.');
    }

    const result = await submitContractTransaction(
      'claim_funds',
      creator,
      [createU32Arg(campaignId), createAddressArg(creator)],
      signTransaction,
    );

    return {
      campaign: await getContractCampaign(campaignId),
      hash: result.hash,
      mode: 'contract',
    };
  }

  return {
    campaign: claimDemoCampaign(campaignId),
    hash: createMockHash('claim'),
    mode: 'demo',
  };
}

export async function refundCampaignContribution(
  campaignId: number,
  address: string,
  signTransaction?: WalletTransactionSigner,
): Promise<{ campaign: Campaign; hash: string; mode: 'contract' | 'demo' }> {
  const campaign = await getCampaign(campaignId);

  if (new Date(campaign.deadline).getTime() > Date.now()) {
    throw new Error('Refunds are only available after the deadline.');
  }

  if (campaign.raised >= campaign.goal) {
    throw new Error('Refunds are unavailable because the campaign met its goal.');
  }

  if (getCampaignOperationMode() === 'contract') {
    if (!signTransaction) {
      throw new Error('Connect a wallet before requesting a refund.');
    }

    const result = await submitContractTransaction(
      'refund',
      address,
      [createU32Arg(campaignId), createAddressArg(address)],
      signTransaction,
    );

    return {
      campaign: await getContractCampaign(campaignId),
      hash: result.hash,
      mode: 'contract',
    };
  }

  return {
    campaign: refundDemoCampaign(campaignId, address),
    hash: createMockHash('refund'),
    mode: 'demo',
  };
}

interface ContractCampaignRecord {
  id: number | bigint;
  creator: string;
  title: string;
  description: string;
  goal: bigint | number | string;
  raised: bigint | number | string;
  deadline: number | bigint | string;
  claimed: boolean;
}

interface ContractBackerRecord {
  backer: string;
  amount: bigint | number | string;
  timestamp: number | bigint | string;
}

async function getContractCampaign(campaignId: number): Promise<Campaign> {
  const [campaignRecord, backerRecords] = await Promise.all([
    simulateContractCall<ContractCampaignRecord>('get_campaign', [
      createU32Arg(campaignId),
    ]),
    simulateContractCall<ContractBackerRecord[]>('get_backers', [
      createU32Arg(campaignId),
    ]),
  ]);

  const backers = [...backerRecords]
    .sort((left, right) => Number(right.timestamp) - Number(left.timestamp))
    .map((backer) => ({
      address: backer.backer,
      amount: fromI128Amount(backer.amount),
      timestamp: new Date(Number(backer.timestamp) * 1000).toISOString(),
    }));

  return {
    id: Number(campaignRecord.id),
    creator: campaignRecord.creator,
    title: campaignRecord.title,
    description: campaignRecord.description,
    goal: fromI128Amount(campaignRecord.goal),
    raised: fromI128Amount(campaignRecord.raised),
    deadline: new Date(Number(campaignRecord.deadline) * 1000).toISOString(),
    claimed: campaignRecord.claimed,
    backers,
  };
}
