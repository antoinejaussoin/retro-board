import { useCallback, useState } from 'react';
import { Template } from '../../../../state/types';
import { getAllTemplates } from '../../../../state/templates';
import useTranslations from '../../../../translations';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { SelectChangeEvent } from '@mui/material';

interface TemplatePickerProps {
  onSelect: (value: Template) => void;
}

const TemplatePicker = ({ onSelect }: TemplatePickerProps) => {
  const translations = useTranslations();
  const [template, setTemplate] = useState<Template>('default');
  const templates = getAllTemplates(translations);
  const handleChange = useCallback(
    (event: SelectChangeEvent<Template>) => {
      const selected = event.target.value as Template;
      setTemplate(selected);
      onSelect(selected);
    },
    [onSelect]
  );
  return (
    <Select value={template} onChange={handleChange} variant="standard">
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
