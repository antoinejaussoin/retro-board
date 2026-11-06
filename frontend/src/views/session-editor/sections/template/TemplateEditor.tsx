import { useCallback } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getTemplateColumnByType } from '../../../../state/columns';
import type { ColumnSettings } from '../../../../state/types';
import { trackEvent } from '../../../../track';
import { Button } from 'ui/button';
import ColumnEditor from './ColumnEditor';

const MAX_NUMBER_OF_COLUMNS = 5;

type TemplateEditorProps = {
  columns: ColumnSettings[];
  onChange: (columns: ColumnSettings[]) => void;
};

export function TemplateEditor({ columns, onChange }: TemplateEditorProps) {
  const { t } = useTranslation();
  const handleColumnChange = useCallback(
    (value: ColumnSettings, index: number) => {
      onChange(Object.assign([], columns, { [index]: value }));
      trackEvent('custom-modal/column/change');
    },
    [onChange, columns],
  );
  const handleAddColumn = useCallback(() => {
    const custom = getTemplateColumnByType(t)('custom');
    onChange([...columns, custom]);
    trackEvent('custom-modal/column/add');
  }, [onChange, columns, t]);
  const handleRemoveColumn = useCallback(
    (column: ColumnSettings) => {
      onChange(columns.filter((item) => item !== column));
      trackEvent('custom-modal/column/remove');
    },
    [onChange, columns],
  );
  return (
    <div className="min-[600px]:min-h-[340px]">
      {columns.map((definition, index) => (
        <ColumnEditor
          key={`${definition.type}-${index}`}
          value={definition}
          canDelete={columns.length > 1}
          onChange={(value) => handleColumnChange(value, index)}
          onRemove={handleRemoveColumn}
        />
      ))}
      {columns.length < MAX_NUMBER_OF_COLUMNS ? (
        <Button variant="secondary" onClick={handleAddColumn} className="mt-2">
          <Plus className="size-4" />
          {t('Customize.customTemplateAddColumn')}
        </Button>
      ) : null}
    </div>
  );
}
