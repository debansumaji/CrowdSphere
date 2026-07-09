'use client';

import { ToastMessage } from '@/components/toast-message';
import { useWallet } from '@/hooks/use-wallet';

export function WalletButton(): JSX.Element {
  const {
    session,
    lastWalletId,
    connectWallet,
    disconnectWallet,
    isConnecting,
    connectionLabel,
    errorMessage,
    clearWalletError,
  } = useWallet();

  if (session) {
    return (
      <>
        <div className="flex items-center gap-0 border border-ink/10">
          <div className="hidden border-r border-ink/10 px-4 py-3 text-sm font-semibold text-ink md:flex">
            Wallet live
          </div>
          <button
            type="button"
            onClick={disconnectWallet}
            className="px-4 py-3 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white"
          >
            Disconnect
          </button>
        </div>
        {errorMessage ? (
          <ToastMessage
            variant="error"
            title="Wallet error"
            message={errorMessage}
            onDismiss={clearWalletError}
          />
        ) : null}
      </>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={async () => {
          clearWalletError();
          try {
            await connectWallet();
          } catch {
            return;
          }
        }}
        disabled={isConnecting}
        className="border border-ink bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-ink"
      >
        {isConnecting ? 'Connecting wallet...' : 'Connect wallet'}
      </button>
      {lastWalletId === 'freighter' ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-smoke">
          Freighter ready
        </p>
      ) : null}
      {errorMessage ? (
        <ToastMessage
          variant="error"
          title="Wallet error"
          message={errorMessage}
          onDismiss={clearWalletError}
        />
      ) : null}
    </div>
  );
}
