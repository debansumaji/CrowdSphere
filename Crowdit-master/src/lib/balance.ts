import { Asset, Horizon, Networks } from '@stellar/stellar-sdk';
import { env } from '@/lib/env';

export async function fetchBalance(address: string): Promise<number> {
  const server = new Horizon.Server(env.horizonUrl);
  const account = await server.loadAccount(address);
  const native = account.balances.find((balance) => {
    return (
      balance.asset_type === Asset.native().getAssetType() ||
      balance.asset_type === 'native'
    );
  });

  if (!native) {
    return 0;
  }

  return Number(native.balance);
}

export function getExplorerTransactionUrl(hash: string): string {
  return `${env.stellarExpertUrl}/tx/${hash}`;
}

export const stellarNetworkPassphrase = Networks.TESTNET;
