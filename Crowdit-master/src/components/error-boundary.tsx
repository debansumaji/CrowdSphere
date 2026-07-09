'use client';

import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  private handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  override componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {}

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6">
          <div className="glass-panel rounded-[34px] p-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-smoke">
              Something went sideways
            </p>
            <h1 className="mt-3 font-display text-3xl text-ink">
              Crowdit hit an unexpected error.
            </h1>
            <p className="mt-4 text-sm leading-6 text-smoke">
              Refresh the page and try again. If the issue persists, reconnect your wallet and retry the action.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 rounded-full bg-violet px-5 py-3 text-sm font-semibold text-white transition hover:bg-violetDeep"
            >
              Reload Crowdit
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
