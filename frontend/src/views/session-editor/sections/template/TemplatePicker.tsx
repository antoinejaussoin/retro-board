import { useCallback, useState } from 'react';
import { Template } from '../../../../state/types';
import { getAllTemplates } from '../../../../state/templates';
import useTranslations from '../../../../translations';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

interface TemplatePickerProps {
  onSelect: (value: Template) => void;
}

const TemplatePicker = ({ onSelect }: TemplatePickerProps) => {
  const translations = useTranslations();
  const [template, setTemplate] = useState<Template>('default');
  const templates = getAllTemplates(translations);
  const handleChange = useCallback(
    (
      event: React.ChangeEvent<{
        name?: string | undefined;
        value: unknown;
      }>
    ) => {
      const selected = event.target.value as Template;
      setTemplate(selected);
      onSelect(selected);
    },
    [onSelect]
  );
  return (
    <Select value={template} onChange={handleChange}>
      {templates.map((template) => {
        return (
          <MenuItem value={template.type} key={template.type}>
            {template.name}
          </MenuItem>
        );
      })}
    </Select>
  );
};

export default TemplatePicker;
