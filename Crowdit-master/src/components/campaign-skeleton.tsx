export function CampaignSkeleton(): JSX.Element {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-soft">
      <div className="shimmer h-6 w-20 rounded-full bg-white/80" />
      <div className="mt-5 shimmer h-8 w-3/4 rounded-2xl bg-white/80" />
      <div className="mt-4 shimmer h-4 w-full rounded-full bg-white/80" />
      <div className="mt-2 shimmer h-4 w-5/6 rounded-full bg-white/80" />
      <div className="mt-8 shimmer h-3 w-full rounded-full bg-white/80" />
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="shimmer h-12 rounded-2xl bg-white/80" />
        <div className="shimmer h-12 rounded-2xl bg-white/80" />
      </div>
      <div className="mt-8 shimmer h-11 w-full rounded-full bg-white/80" />
    </div>
  );
}
