import { Pencil } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from 'ui/cn';

interface EditableLabelProps {
  value: string;
  readOnly?: boolean;
  placeholder?: string;
  multiline?: boolean;
  label?: string;
  focused?: boolean;
  wrapText?: boolean;
  centered?: boolean;
  onChange: (value: string) => void;
}

const EditableLabel = ({
  value,
  readOnly,
  placeholder,
  multiline,
  label,
  focused,
  wrapText = false,
  centered,
  onChange,
}: EditableLabelProps) => {
  const [editMode, setEditMode] = useState(false);
  const [current, setCurrent] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const enableViewMode = useCallback(() => {
    setEditMode(false);
    onChange(current);
  }, [onChange, current]);
  const enableEditMode = useCallback(() => {
    setEditMode(true);
  }, []);
  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      if (event.nativeEvent.keyCode === 13 && !event.nativeEvent.shiftKey) {
        setEditMode(false);
        onChange(current);
      }
    },
    [onChange, current],
  );
  const handleChange = useCallback(
    (event: React.FormEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setCurrent(event.currentTarget.value);
    },
    [],
  );

  useEffect(() => {
    if (editMode && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editMode]);

  useEffect(() => {
    if (focused) {
      setEditMode(true);
    }
  }, [focused]);

  useEffect(() => {
    setCurrent(value);
  }, [value]);

  const fieldClass = cn(
    'w-full flex-1 border-0 bg-transparent p-0 font-[inherit] text-[length:inherit] leading-normal tracking-[inherit] outline-none',
    centered && 'text-center',
  );

  return (
    <span
      className={cn(
        'max-w-full',
        multiline ? 'flex w-full' : 'inline-flex',
      )}
    >
      {editMode ? (
        <span
          className={cn(
            'flex w-full items-center',
            multiline && 'min-w-0',
          )}
        >
          {multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              aria-label={`${label} input`}
              data-testid={`${label} input`}
              value={current}
              onBlur={enableViewMode}
              onKeyPress={handleKeyPress}
              onChange={handleChange}
              className={fieldClass}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              aria-label={`${label} input`}
              data-testid={`${label} input`}
              value={current}
              onBlur={enableViewMode}
              onKeyPress={handleKeyPress}
              onChange={handleChange}
              className={fieldClass}
            />
          )}
          <Pencil className="ml-1.5 size-3.5 shrink-0 opacity-0" />
        </span>
      ) : readOnly ? (
        <span
          className={cn(
            'items-center',
            multiline ? 'flex w-full' : 'inline-flex',
          )}
          aria-label={label}
        >
          <span
            className={cn(
              multiline && 'w-full',
              wrapText ? 'whitespace-pre-wrap' : 'whitespace-nowrap',
            )}
          >
            {current || placeholder}
          </span>
        </span>
      ) : (
        <button
          type="button"
          className={cn(
            'items-center gap-1 text-left',
            multiline ? 'flex w-full' : 'inline-flex',
          )}
          onClick={enableEditMode}
        >
          <span
            aria-label={label}
            data-testid={label}
            className={cn(
              'min-w-0 leading-normal',
              multiline && 'w-full flex-1',
              wrapText ? 'whitespace-pre-wrap' : 'whitespace-nowrap',
            )}
          >
            {current || placeholder}
          </span>
          <Pencil className="size-3.5 shrink-0 text-muted hover:text-primary-600" />
        </button>
      )}
    </span>
  );
};

export default EditableLabel;
