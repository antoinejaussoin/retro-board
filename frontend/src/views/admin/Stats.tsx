import { useAdminStats } from './useAdminStats';

export function Stats() {
  const stats = useAdminStats();

  return (
    <div className="flex items-center gap-2.5 text-sm">
      <span className="relative flex size-2.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#44b700] opacity-75" />
        <span className="relative inline-flex size-2.5 rounded-full bg-[#44b700]" />
      </span>
      <span>
        Connected Users: <b>{stats?.clients}</b>
      </span>
    </div>
  );
}
