'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { stellarNetworkPassphrase } from '@/lib/balance';
import type { WalletId, WalletSession } from '@/types';

const STORAGE_KEY = 'crowdit:last-wallet-session';
const TEST_WALLET_KEY = '__CROWDIT_TEST_WALLET__';

interface WalletContextValue {
  session: WalletSession | null;
  lastWalletId: WalletId | null;
  isConnecting: boolean;
  connectionLabel: string | null;
  errorMessage: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  clearWalletError: () => void;
  signTransaction: (xdr: string, address?: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

interface FreighterResponseWithError {
  error?: string | { message?: string };
}

interface FreighterAddressResponse extends FreighterResponseWithError {
  address: string;
}

interface FreighterSignTransactionResponse extends FreighterResponseWithError {
  signedTxXdr: string;
  signerAddress?: string;
}

interface FreighterApi {
  getAddress: () => Promise<FreighterAddressResponse>;
  requestAccess: () => Promise<FreighterAddressResponse>;
  signTransaction: (
    xdr: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
    },
  ) => Promise<FreighterSignTransactionResponse>;
}

async function resolveMockAddress(): Promise<string> {
  return `GFREIGHTER${'1'.repeat(37)}`;
}

function isTestWalletEnabled(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return Boolean(Reflect.get(window as unknown as Record<string, unknown>, TEST_WALLET_KEY));
}

async function loadFreighterApi(): Promise<FreighterApi> {
  const freighterApi = await import('@stellar/freighter-api');

  return {
    getAddress: freighterApi.getAddress,
    requestAccess: freighterApi.requestAccess,
    signTransaction: freighterApi.signTransaction,
  };
}

function getFreighterErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = Reflect.get(error, 'message');
    if (typeof message === 'string') {
      return message;
    }
  }

  if (error && typeof error === 'object' && 'error' in error) {
    const nested = Reflect.get(error, 'error');

    if (typeof nested === 'string') {
      return nested;
    }

    if (nested && typeof nested === 'object' && 'message' in nested) {
      const nestedMessage = Reflect.get(nested, 'message');
      if (typeof nestedMessage === 'string') {
        return nestedMessage;
      }
    }
  }

  return 'Unable to complete the Freighter request right now.';
}

export function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [session, setSession] = useState<WalletSession | null>(null);
  const [lastWalletId, setLastWalletId] = useState<WalletId | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionLabel, setConnectionLabel] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as WalletSession;
      setLastWalletId(parsed.walletId);

      if (isTestWalletEnabled()) {
        setSession(parsed);
        return;
      }

      void loadFreighterApi()
        .then((freighterApi) => freighterApi.getAddress())
        .then((response) => {
          if (!response.address || response.error) {
            window.localStorage.removeItem(STORAGE_KEY);
            return;
          }

          const nextSession: WalletSession = {
            address: response.address,
            walletId: 'freighter',
          };
          setSession(nextSession);
        })
        .catch(() => {
          window.localStorage.removeItem(STORAGE_KEY);
        });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const value = useMemo<WalletContextValue>(() => {
    return {
      session,
      lastWalletId,
      isConnecting,
      connectionLabel,
      errorMessage,
      clearWalletError: () => setErrorMessage(null),
      disconnectWallet: () => {
        setSession(null);
        setLastWalletId(null);
        setConnectionLabel(null);
        setErrorMessage(null);

        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      },
      signTransaction: async (xdr, address) => {
        if (isTestWalletEnabled()) {
          return xdr;
        }

        const signerAddress = address ?? session?.address;

        if (!signerAddress) {
          throw new Error('Connect a wallet before signing a transaction.');
        }

        try {
          const freighterApi = await loadFreighterApi();
          const response = await freighterApi.signTransaction(xdr, {
            address: signerAddress,
            networkPassphrase: stellarNetworkPassphrase,
          });

          if (response.error) {
            throw new Error(getFreighterErrorMessage(response));
          }

          return response.signedTxXdr;
        } catch (error) {
          const message = getFreighterErrorMessage(error);

          if (/cancel|reject|declin/i.test(message)) {
            throw new Error('Transaction cancelled by user.');
          }

          throw new Error(message);
        }
      },
      connectWallet: async () => {
        setIsConnecting(true);
        setConnectionLabel('Connecting to Freighter...');
        setErrorMessage(null);

        try {
          if (isTestWalletEnabled()) {
            const address = await resolveMockAddress();
            const nextSession: WalletSession = { address, walletId: 'freighter' };
            setSession(nextSession);
            setLastWalletId('freighter');

            if (typeof window !== 'undefined') {
              window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
            }

            return;
          }

          const freighterApi = await loadFreighterApi();
          const response = await freighterApi.requestAccess();
          if (response.error) {
            throw new Error(getFreighterErrorMessage(response));
          }

          if (!response.address) {
            throw new Error('Freighter did not return an address.');
          }

          const nextSession: WalletSession = {
            address: response.address,
            walletId: 'freighter',
          };
          setSession(nextSession);
          setLastWalletId('freighter');

          if (typeof window !== 'undefined') {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
          }
        } catch (error) {
          const rawMessage = getFreighterErrorMessage(error);
          const message = /not supported|browser extension is not available|could not establish connection|missing/i.test(
            rawMessage,
          )
            ? 'Freighter is not installed. Please install Freighter and try again.'
            : rawMessage;
          setErrorMessage(message);
          throw new Error(message);
        } finally {
          setIsConnecting(false);
          setConnectionLabel(null);
        }
      },
    };
  }, [connectionLabel, errorMessage, isConnecting, lastWalletId, session]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }

  return context;
}
