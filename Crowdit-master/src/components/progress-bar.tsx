import { getProgress } from '@/lib/format';

export function ProgressBar({
  raised,
  goal,
  large = false,
}: {
  raised: number;
  goal: number;
  large?: boolean;
}): JSX.Element {
  const progress = getProgress(raised, goal);

  return (
    <div className="w-full">
      <div
        className={`overflow-hidden rounded-full bg-ink/8 ${large ? 'h-4' : 'h-3'}`}
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet via-violetDeep to-ink transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-medium uppercase tracking-[0.22em] text-smoke">
        {progress}% funded
      </p>
    </div>
  );
}
