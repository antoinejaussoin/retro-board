import { useCallback } from 'react';
import SettingCategory from '../SettingCategory';
import OptionItem from '../OptionItem';
import TemplatePicker from './TemplatePicker';
import useTranslations from '../../../../translations';
import { ColumnSettings, Template } from '../../../../state/types';
import TemplateEditor from './TemplateEditor';
import { buildDefaults } from '../../../../state/columns';
import { trackEvent } from '../../../../track';

interface TemplateSectionProps {
  columns: ColumnSettings[];
  onChange: (columns: ColumnSettings[]) => void;
}

function TemplateSection({ columns, onChange }: TemplateSectionProps) {
  const translations = useTranslations();
  const { Customize } = translations;

  const handleTemplateChange = useCallback(
    (templateType: Template) => {
      const template = buildDefaults(templateType, translations);
      onChange(template);
      trackEvent('custom-modal/template/select');
    },
    [translations, onChange]
  );

  return (
    <SettingCategory
      title={Customize.customTemplateCategory!}
      subtitle={Customize.customTemplateCategorySub!}
    >
      <OptionItem
        label={Customize.template!}
        help={Customize.templateHelp!}
        wide
      >
        <TemplatePicker onSelect={handleTemplateChange} />
      </OptionItem>
      <TemplateEditor columns={columns} onChange={onChange} />
    </SettingCategory>
  );
}

export default TemplateSection;
