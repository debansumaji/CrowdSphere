export const env = {
  network:
    process.env.NEXT_PUBLIC_NETWORK ?? process.env.VITE_NETWORK ?? 'testnet',
  contractId:
    process.env.NEXT_PUBLIC_CONTRACT_ID ?? process.env.VITE_CONTRACT_ID ?? '',
  rewardTokenId:
    process.env.NEXT_PUBLIC_REWARD_TOKEN_ID ??
    process.env.VITE_REWARD_TOKEN_ID ??
    '',
  sorobanRpcUrl:
    process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ??
    process.env.VITE_SOROBAN_RPC_URL ??
    'https://soroban-testnet.stellar.org',
  horizonUrl:
    process.env.NEXT_PUBLIC_HORIZON_URL ??
    process.env.VITE_HORIZON_URL ??
    'https://horizon-testnet.stellar.org',
  stellarExpertUrl:
    process.env.NEXT_PUBLIC_STELLAR_EXPERT_URL ??
    process.env.VITE_STELLAR_EXPERT_URL ??
    'https://stellar.expert/explorer/testnet',
};

export const appMode = env.contractId ? 'contract' : 'demo';
