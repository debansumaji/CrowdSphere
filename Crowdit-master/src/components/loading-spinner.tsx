export function LoadingSpinner({
  label = 'Loading...',
  size = 'md',
}: {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}): JSX.Element {
  const dimensions = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-10 w-10' : 'h-6 w-6';

  return (
    <div className="flex items-center gap-3 text-sm font-medium text-ink/80">
      <span className={`inline-block animate-spin rounded-full border-2 border-ink/20 border-t-violet ${dimensions}`} />
      <span>{label}</span>
    </div>
  );
}
