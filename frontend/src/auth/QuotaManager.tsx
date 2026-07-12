import React from 'react';

/** Kept as a pass-through wrapper for layout compatibility; quota is loaded via TanStack Query. */
export default function QuotaManager({
  children,
}: React.PropsWithChildren<{}>) {
  return <>{children}</>;
}
