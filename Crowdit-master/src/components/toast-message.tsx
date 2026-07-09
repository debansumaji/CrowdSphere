import { getExplorerTransactionUrl } from '@/lib/balance';
import { truncateAddress } from '@/lib/format';

type ToastVariant = 'pending' | 'success' | 'error';

const toastStyles: Record<ToastVariant, string> = {
  pending: 'border-violet/30 bg-white text-ink shadow-[0_22px_60px_rgba(91,33,182,0.14)]',
  success: 'border-violet/25 bg-violet text-white shadow-[0_22px_60px_rgba(91,33,182,0.26)]',
  error: 'border-red-300 bg-red-600 text-white shadow-[0_22px_60px_rgba(185,28,28,0.24)]',
};

export function ToastMessage({
  variant,
  title,
  message,
  hash,
  onDismiss,
}: {
  variant: ToastVariant;
  title: string;
  message?: string;
  hash?: string;
  onDismiss?: () => void;
}): JSX.Element {
  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[70] w-full max-w-sm sm:right-6 lg:right-8">
      <div
        className={`pointer-events-auto rounded-[28px] border px-5 py-4 backdrop-blur-xl ${toastStyles[variant]}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">{title}</p>
            {message ? <p className="mt-1 text-sm/6 opacity-95">{message}</p> : null}
          </div>
          {onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-full border border-current/15 px-2.5 py-1 text-xs font-semibold text-current transition hover:bg-black/5"
              aria-label="Dismiss notification"
            >
              Close
            </button>
          ) : null}
        </div>
        {hash ? (
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] opacity-80">
            Tx hash: {truncateAddress(hash)}
          </p>
        ) : null}
        {hash ? (
          <a
            href={getExplorerTransactionUrl(hash)}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex text-sm font-semibold underline underline-offset-4"
          >
            View transaction on Stellar Expert
          </a>
        ) : null}
      </div>
    </div>
  );
}
