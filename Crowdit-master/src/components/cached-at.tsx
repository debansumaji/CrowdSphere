'use client';

import { useEffect, useState } from 'react';
import { formatRelativeUpdate } from '@/lib/format';

export function CachedAt({
  updatedAt,
}: {
  updatedAt: number;
}): JSX.Element {
  const [label, setLabel] = useState(() => formatRelativeUpdate(updatedAt));

  useEffect(() => {
    setLabel(formatRelativeUpdate(updatedAt));
    const interval = window.setInterval(() => {
      setLabel(formatRelativeUpdate(updatedAt));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [updatedAt]);

  return (
    <p className="text-xs font-medium uppercase tracking-[0.22em] text-smoke">
      Last updated: {label}
    </p>
  );
}
