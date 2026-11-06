import { lazy, Suspense, useCallback, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { TwitterPicker, type ColorResult } from 'react-color';
import EditableLabel from '../../../../components/EditableLabel';
import { useMediaQuery } from 'hooks/useMediaQuery';
import type { ColumnSettings } from '../../../../state/types';
import { IconButton } from 'ui/icon-button';
import { Popover, PopoverContent, PopoverTrigger } from 'ui/popover';

const IconPicker = lazy(() => import('./IconPicker'));

interface ColumnEditorProps {
  value: ColumnSettings;
  canDelete: boolean;
  onChange: (value: ColumnSettings) => void;
  onRemove: (value: ColumnSettings) => void;
}

const palette = [
  '#E8F5E9',
  '#FFEBEE',
  '#FFFDE7',
  '#BBDEFB',
  '#E1BEE7',
  '#FFE0B2',
  '#FFCCBC',
  '#B2EBF2',
  '#D7CCC8',
  '#CFD8DC',
];

const ColumnEditor = ({
  value,
  canDelete,
  onChange,
  onRemove,
}: ColumnEditorProps) => {
  const fullScreen = useMediaQuery('(max-width:600px)');
  const [pickerOpen, setPickerOpen] = useState(false);
  const handleLabelChange = useCallback(
    (label: string) => {
      onChange({
        ...value,
        label,
      });
    },
    [onChange, value],
  );
  const handleColorChange = useCallback(
    (result: ColorResult) => {
      onChange({
        ...value,
        color: result.hex,
      });
      setPickerOpen(false);
    },
    [onChange, value],
  );

  const handleIconChange = useCallback(
    (icon: string) => {
      onChange({
        ...value,
        icon,
      });
    },
    [onChange, value],
  );
  const handleRemove = useCallback(() => {
    onRemove(value);
  }, [value, onRemove]);

  const deleteButton = canDelete ? (
    <IconButton
      onClick={handleRemove}
      aria-label="Delete column"
      className="text-red-600"
    >
      <Trash2 className="size-4" />
    </IconButton>
  ) : null;

  return (
    <div className="flex w-full items-center gap-3 py-2.5 max-[600px]:flex-col max-[600px]:items-start">
      <div className="flex items-center gap-4 max-[600px]:mb-1">
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Column color"
              className="size-6 rounded-md shadow ring-1 ring-black/10"
              style={{ backgroundColor: value.color }}
            />
          </PopoverTrigger>
          <PopoverContent align="start" className="z-[70] w-auto p-0">
            <TwitterPicker
              colors={palette}
              triangle="hide"
              color={value.color}
              onChange={handleColorChange}
            />
          </PopoverContent>
        </Popover>
        <Suspense fallback={<span />}>
          <IconPicker value={value.icon} onChange={handleIconChange} />
        </Suspense>
        {fullScreen ? deleteButton : null}
      </div>
      <div className="min-w-0 flex-1">
        <EditableLabel
          wrapText
          value={value.label}
          onChange={handleLabelChange}
          placeholder={value.label || '(empty)'}
        />
      </div>
      {!fullScreen ? deleteButton : null}
    </div>
  );
};

export default ColumnEditor;
