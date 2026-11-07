import { useTranslation } from 'react-i18next';
import { cn } from 'ui/cn';

type ExamplesProps = {
  onSelect: (message: string) => void;
};

const tones = [
  'border-sky-200 text-sky-800 hover:bg-sky-50',
  'border-orange-200 text-orange-800 hover:bg-orange-50',
  'border-emerald-200 text-emerald-800 hover:bg-emerald-50',
  'border-purple-200 text-purple-800 hover:bg-purple-50',
  'border-cyan-200 text-cyan-800 hover:bg-cyan-50',
];

function asExamples(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string');
}

export function Examples({ onSelect }: ExamplesProps) {
  const { t } = useTranslation();
  const examples = asExamples(t('Ai.examples', { returnObjects: true }));

  return (
    <div className="w-full">
      <h2 className="text-center text-xl font-light text-muted">
        {t('Ai.examplesTitle')}
      </h2>
      <div className="mt-4 flex flex-wrap justify-center px-2">
        {examples.map((example, index) => (
          <button
            key={example}
            type="button"
            onClick={() => onSelect(example)}
            className={cn(
              'm-1.5 inline-flex rounded-full border px-3 py-2 text-left text-sm transition',
              tones[index % tones.length],
            )}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
