import { appMode, env } from '@/lib/env';

export function AppModePanel(): JSX.Element {
  return (
    <section className="glass-panel border-l-4 border-l-violet p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-smoke">Network mode</p>
          <h3 className="mt-2 font-display text-2xl text-ink">
            {appMode === 'contract' ? 'Soroban contract mode' : 'Demo data mode'}
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-smoke">
            Network: {env.network}. {appMode === 'contract'
              ? 'The frontend is configured to use a deployed contract id.'
              : 'The frontend is using local demo campaign state until a deployed contract id is provided.'}
          </p>
        </div>
        <span
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] ${
            appMode === 'contract'
              ? 'bg-violet/12 text-violet'
              : 'bg-ink/8 text-smoke'
          }`}
        >
          {appMode}
        </span>
      </div>
    </section>
  );
}
