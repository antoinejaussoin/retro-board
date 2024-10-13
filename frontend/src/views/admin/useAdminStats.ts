import type { AdminStats } from 'common';
import { useEffect, useState } from 'react';
import { fetchAdminStats } from './api';

export function useAdminStats(): AdminStats | null {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    async function load() {
      const stats = await fetchAdminStats();
      setStats(stats);
    }
    load();
    const handle = setInterval(() => {
      load();
    }, 1000);

    return () => clearInterval(handle);
  }, []);

  return stats;
}
