import { env } from '@/lib/env';
import {
  createAddressArg,
  simulateContractCallById,
} from '@/lib/soroban';

interface RewardMetadata {
  name: string;
  symbol: string;
  decimals: number;
}

function getRewardContractId(): string {
  if (!env.rewardTokenId) {
    throw new Error('Missing NEXT_PUBLIC_REWARD_TOKEN_ID for reward token reads.');
  }

  return env.rewardTokenId;
}

export async function getRewardBalance(address: string): Promise<number> {
  const balance = await simulateContractCallById<bigint | number | string>(
    getRewardContractId(),
    'balance',
    [createAddressArg(address)],
  );

  return Number(balance) / 10_000_000;
}

export async function getRewardMetadata(): Promise<RewardMetadata> {
  const metadata = await simulateContractCallById<RewardMetadata>(
    getRewardContractId(),
    'metadata',
    [],
  );

  return metadata;
}
