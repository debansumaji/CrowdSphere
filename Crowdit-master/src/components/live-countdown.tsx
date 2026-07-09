'use client';

import { useEffect, useState } from 'react';

function getCountdownLabel(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now();

  if (diff <= 0) {
    return 'Ended';
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h left`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }

  return `${minutes}m left`;
}

export function LiveCountdown({
  deadline,
}: {
  deadline: string;
}): JSX.Element {
  const [label, setLabel] = useState(() => getCountdownLabel(deadline));

  useEffect(() => {
    setLabel(getCountdownLabel(deadline));
    const interval = window.setInterval(() => {
      setLabel(getCountdownLabel(deadline));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [deadline]);

  return <>{label}</>;
}
