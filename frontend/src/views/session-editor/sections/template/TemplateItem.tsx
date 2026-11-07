import { useTranslation } from 'react-i18next';
import Icon from 'components/Icon/Icon';
import { getTemplateColumns } from 'state';
import type { Template, TemplateDefinition } from 'state/types';
import { cn } from 'ui/cn';

type TemplateItemProps = {
  definition: TemplateDefinition;
  selected: boolean;
  onSelect: (template: Template) => void;
};

export function TemplateItem({
  definition,
  selected,
  onSelect,
}: TemplateItemProps) {
  const { t } = useTranslation();
  const columns = getTemplateColumns(definition.type, t);
  return (
    <button
      type="button"
      onClick={() => {
        onSelect(definition.type);
      }}
      className={cn(
        'flex min-w-[185px] cursor-pointer flex-col items-center rounded-2xl border border-line px-3 py-3 text-ink shadow-card transition',
        selected
          ? 'border-primary-700 bg-primary-700 text-white hover:bg-primary-800'
          : 'bg-cream hover:bg-primary-50',
      )}
    >
      <span className="flex w-full justify-around">
        {columns.map((column) => (
          <Icon key={column.type} icon={column.icon} />
        ))}
      </span>
      <span className="mt-3 text-xs">{definition.name}</span>
    </button>
  );
}
