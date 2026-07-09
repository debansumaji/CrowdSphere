import type { Route } from 'next';
import Link from 'next/link';

export function EmptyState({
  eyebrow,
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: Route;
}): JSX.Element {
  return (
    <div className="glass-panel rounded-[30px] p-8 text-center">
      <p className="eyebrow text-smoke">{eyebrow}</p>
      <h3 className="mt-3 font-display text-3xl text-ink">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-smoke">{description}</p>
      {ctaLabel && ctaHref ? (
        <div className="mt-6 flex justify-center">
          <Link
            href={ctaHref}
            className="rounded-full bg-violet px-5 py-3 text-sm font-semibold text-white transition hover:bg-violetDeep"
          >
            {ctaLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
