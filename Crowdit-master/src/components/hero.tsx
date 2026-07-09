import Link from 'next/link';

const supportedWallets = ['Freighter'];
const liveStats = [
  { label: 'Network', value: 'Testnet live' },
  { label: 'Signing', value: 'Wallet-first' },
  { label: 'Model', value: 'Direct support' },
];

export function Hero(): JSX.Element {
  return (
    <section className="fade-in grid gap-0 border border-ink/10 lg:grid-cols-[1.18fr_0.82fr]">
      <div className="p-6 sm:p-8 lg:border-r lg:border-ink/10 lg:p-10">
        <p className="eyebrow text-smoke">Live campaign board</p>
        <h1 className="mt-5 max-w-4xl font-display text-5xl leading-[0.92] text-ink sm:text-6xl lg:text-[5.75rem]">
          Fund live ideas without burying the ask under platform noise.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-smoke sm:text-lg">
          Crowdit gives campaigns a tighter surface: the brief, the deadline, the support curve, and the final action path all stay visible from the same page.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/campaigns"
            className="inline-flex items-center justify-center border border-ink bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-ink"
          >
            Browse live campaigns
          </Link>
          <Link
            href="/create"
            className="inline-flex items-center justify-center border border-ink/10 px-6 py-3 text-sm font-semibold text-ink transition hover:border-violet hover:text-violet"
          >
            Start a campaign
          </Link>
        </div>
      </div>

      <div className="surface-dark p-6 sm:p-8 lg:p-10">
        <p className="eyebrow text-violet-200">At a glance</p>
        <div className="mt-5 space-y-0 border border-white/10">
          {liveStats.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 last:border-b-0"
            >
              <p className="text-sm text-white/55">{item.label}</p>
              <p className="text-sm font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <p className="eyebrow text-white/42">Wallet support</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {supportedWallets.map((wallet) => (
              <span
                key={wallet}
                className="border border-white/10 px-3 py-2 text-sm font-semibold text-white/78"
              >
                {wallet}
              </span>
            ))}
          </div>
        </div>
        <p className="mt-8 text-sm leading-7 text-white/68">
          Designed for people who want the campaign state to stay readable while they decide whether to back, wait, claim, or refund.
        </p>
      </div>
    </section>
  );
}
