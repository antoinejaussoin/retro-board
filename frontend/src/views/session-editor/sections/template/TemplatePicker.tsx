import { useTranslation } from 'react-i18next';
import {
  getAllTemplates,
  getTemplateColumns,
} from '../../../../state/templates';
import type {
  ColumnSettings,
  Template,
  TranslationFunction,
} from '../../../../state/types';
import { TemplateItem } from './TemplateItem';

interface TemplatePickerProps {
  current: ColumnSettings[];
  onSelect: (value: Template) => void;
}

export function TemplatePicker({ current, onSelect }: TemplatePickerProps) {
  const { t } = useTranslation();
  const templates = getAllTemplates(t);

  return (
    <div className="flex flex-wrap gap-2.5 py-2.5">
      {templates
        .filter((definition) => definition.type !== 'default')
        .map((definition) => (
          <TemplateItem
            key={definition.type}
            definition={definition}
            selected={isSelected(current, definition.type, t)}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}

function isSelected(
  current: ColumnSettings[],
  templateType: Template,
  t: TranslationFunction,
) {
  const template = getTemplateColumns(templateType, t);
  if (current.length !== template.length) {
    return false;
  }
  for (let i = 0; i < current.length; i++) {
    if (
      current[i].type !== template[i].type ||
      current[i].color !== template[i].color ||
      current[i].icon !== template[i].icon
    ) {
      return false;
    }
  }
  return true;
}
