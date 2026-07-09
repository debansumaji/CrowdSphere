import {
  Account,
  Address,
  BASE_FEE,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
  xdr,
} from '@stellar/stellar-sdk';
import { stellarNetworkPassphrase } from '@/lib/balance';
import { env } from '@/lib/env';

const NULL_ACCOUNT = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';
const STROOPS_PER_XLM = 10_000_000;
const REQUEST_TIMEOUT_SECONDS = 30;

export type WalletTransactionSigner = (
  xdr: string,
  address: string,
) => Promise<string>;

function getServer(): rpc.Server {
  return new rpc.Server(env.sorobanRpcUrl);
}

export function getSorobanServer(): rpc.Server {
  return getServer();
}

function getContract(): Contract {
  if (!env.contractId) {
    throw new Error('Missing NEXT_PUBLIC_CONTRACT_ID for Soroban contract mode.');
  }

  return new Contract(env.contractId);
}

function getContractById(contractId: string): Contract {
  if (!contractId) {
    throw new Error('Missing contract ID for Soroban contract read.');
  }

  return new Contract(contractId);
}

function getInvokeErrorMessage(message: string): string {
  if (/cancel|reject|declin/i.test(message)) {
    return 'Transaction cancelled by user.';
  }

  return message;
}

function ensureSimulationSuccess(
  simulation: rpc.Api.SimulateTransactionResponse,
): rpc.Api.SimulateTransactionSuccessResponse | rpc.Api.SimulateTransactionRestoreResponse {
  if (rpc.Api.isSimulationError(simulation)) {
    throw new Error(
      getInvokeErrorMessage(
        simulation.error || 'Soroban simulation failed before submission.',
      ),
    );
  }

  return simulation;
}

function parseScVal<T>(value: xdr.ScVal | undefined): T {
  if (!value) {
    throw new Error('Contract call did not return a result.');
  }

  return scValToNative(value) as T;
}

export function toI128Amount(amount: number): bigint {
  return BigInt(Math.round(amount * STROOPS_PER_XLM));
}

export function fromI128Amount(amount: bigint | number | string): number {
  const numeric =
    typeof amount === 'bigint'
      ? Number(amount)
      : typeof amount === 'string'
        ? Number(amount)
        : amount;

  return numeric / STROOPS_PER_XLM;
}

export function createAddressArg(address: string): xdr.ScVal {
  return Address.fromString(address).toScVal();
}

export function createU32Arg(value: number): xdr.ScVal {
  return nativeToScVal(value, { type: 'u32' });
}

export function createU64Arg(value: number): xdr.ScVal {
  return nativeToScVal(BigInt(value), { type: 'u64' });
}

export function createI128Arg(value: number): xdr.ScVal {
  return nativeToScVal(toI128Amount(value), { type: 'i128' });
}

export function createStringArg(value: string): xdr.ScVal {
  return nativeToScVal(value);
}

export async function simulateContractCall<T>(
  method: string,
  args: xdr.ScVal[],
): Promise<T> {
  return simulateContractCallById<T>(env.contractId, method, args);
}

export async function simulateContractCallById<T>(
  contractId: string,
  method: string,
  args: xdr.ScVal[],
): Promise<T> {
  const contract = getContractById(contractId);
  const server = getServer();
  const transaction = new TransactionBuilder(new Account(NULL_ACCOUNT, '0'), {
    fee: BASE_FEE,
    networkPassphrase: stellarNetworkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(REQUEST_TIMEOUT_SECONDS)
    .build();

  const simulation = ensureSimulationSuccess(
    await server.simulateTransaction(transaction),
  );

  return parseScVal<T>(simulation.result?.retval);
}

export async function submitContractTransaction<T>(
  method: string,
  sourceAddress: string,
  args: xdr.ScVal[],
  signTransaction: WalletTransactionSigner,
): Promise<{ hash: string; returnValue?: T }> {
  const contract = getContract();
  const server = getServer();
  const sourceAccount = await server.getAccount(sourceAddress);
  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: stellarNetworkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(REQUEST_TIMEOUT_SECONDS)
    .build();

  const preparedTransaction = await server.prepareTransaction(transaction);

  let signedTxXdr = '';

  try {
    signedTxXdr = await signTransaction(
      preparedTransaction.toXDR(),
      sourceAddress,
    );
  } catch (error) {
    throw new Error(
      getInvokeErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to sign transaction with the connected wallet.',
      ),
    );
  }

  const signedTransaction = TransactionBuilder.fromXDR(
    signedTxXdr,
    stellarNetworkPassphrase,
  );
  const submission = await server.sendTransaction(signedTransaction);

  if (submission.status === 'ERROR') {
    throw new Error(
      'The network rejected the transaction before it could be submitted.',
    );
  }

  if (submission.status === 'TRY_AGAIN_LATER') {
    throw new Error(
      'The Soroban RPC server is busy. Please retry your transaction in a moment.',
    );
  }

  const result = await server.pollTransaction(submission.hash);

  if (result.status === rpc.Api.GetTransactionStatus.SUCCESS) {
    return {
      hash: submission.hash,
      returnValue: result.returnValue
        ? parseScVal<T>(result.returnValue)
        : undefined,
    };
  }

  if (result.status === rpc.Api.GetTransactionStatus.FAILED) {
    throw new Error('The transaction was submitted but failed on-chain.');
  }

  throw new Error(
    'The transaction was submitted but its final on-chain status could not be confirmed yet.',
  );
}
