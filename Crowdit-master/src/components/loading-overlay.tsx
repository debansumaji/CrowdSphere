import { LoadingSpinner } from '@/components/loading-spinner';

export function LoadingOverlay({
  label,
}: {
  label: string;
}): JSX.Element {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[32px] bg-white/70 backdrop-blur-sm">
      <div className="rounded-[28px] border border-white/80 bg-white/90 px-6 py-5 shadow-soft">
        <LoadingSpinner label={label} />
      </div>
    </div>
  );
}
