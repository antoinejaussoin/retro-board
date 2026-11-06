import type { PropsWithChildren } from 'react';

interface StepProps {
  index: number;
  title?: string;
  description?: string;
}

export default function Step({
  index,
  title,
  description,
  children,
}: PropsWithChildren<StepProps>) {
  return (
    <section className="flex items-start gap-4 rounded-3xl border border-line bg-cream p-6">
      <div className="text-3xl font-medium tracking-tight text-muted sm:text-5xl">
        {index}
      </div>
      <div className="min-w-0 flex-1">
        <header className="pb-4">
          <h2 className="text-2xl font-medium tracking-tight">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
          ) : null}
        </header>
        <div>{children}</div>
      </div>
    </section>
  );
}
