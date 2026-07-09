import { ToastMessage } from '@/components/toast-message';
import type { TransactionState } from '@/types';

export function TransactionStatus({
  state,
  onDismiss,
}: {
  state: TransactionState;
  onDismiss?: () => void;
}): JSX.Element | null {
  if (state.status === 'idle') {
    return null;
  }

  return (
    <ToastMessage
      variant={
        state.status === 'success'
          ? 'success'
          : state.status === 'error'
            ? 'error'
            : 'pending'
      }
      title={
        state.status === 'pending'
          ? 'Pending...'
          : state.status === 'success'
            ? 'Success!'
            : 'Failed'
      }
      message={state.message}
      hash={state.hash}
      onDismiss={state.status === 'pending' ? undefined : onDismiss}
    />
  );
}
