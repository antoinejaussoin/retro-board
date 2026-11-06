import type { PropsWithChildren } from 'react';
import { Alert } from 'ui/alert';

interface SettingCategoryProps {
  title: string;
  subtitle: string;
}

export default function SettingCategory({
  subtitle,
  children,
}: PropsWithChildren<SettingCategoryProps>) {
  return (
    <div>
      <Alert severity="success" className="mt-2">
        {subtitle}
      </Alert>
      <div className="w-full">{children}</div>
    </div>
  );
}
