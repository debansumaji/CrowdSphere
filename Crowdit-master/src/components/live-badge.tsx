export function LiveBadge(): JSX.Element {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-violet/20 bg-violet/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet">
      <span className="h-2 w-2 animate-pulse rounded-full bg-violet" />
      Live
    </span>
  );
}
