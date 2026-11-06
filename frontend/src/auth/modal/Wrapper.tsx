import { HelpButton } from 'components/HelpButton';
import type { PropsWithChildren, ReactNode } from 'react';

interface WrapperProps {
  header?: ReactNode;
  actions?: ReactNode;
  help?: ReactNode;
}

export default function Wrapper({
  header,
  help,
  actions,
  children,
}: PropsWithChildren<WrapperProps>) {
  return (
    <div>
      <div className="mt-1 mb-5 flex items-center gap-2 pr-8">
        <h2 className="min-w-0 flex-1 text-2xl font-medium tracking-tight text-ink">
          {header}
        </h2>
        {help ? (
          <span className="shrink-0 text-muted">
            <HelpButton>{help}</HelpButton>
          </span>
        ) : null}
      </div>
      <div>{children}</div>
      {actions ? (
        <div className="mt-5 flex items-center justify-end gap-2.5">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
