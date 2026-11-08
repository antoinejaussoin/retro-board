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

  const textClass = cn(
    'font-[inherit] text-[length:inherit] leading-normal tracking-[inherit]',
    centered && 'text-center',
  );
  const fieldClass = cn(
    textClass,
    'border-0 bg-transparent p-0 outline-none',
    wrapText ? 'whitespace-pre-wrap' : 'whitespace-pre',
  );
  const shown = current || placeholder || '';

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
            'max-w-full items-center gap-1',
            multiline ? 'flex w-full min-w-0' : 'inline-flex',
          )}
        >
          {multiline ? (
            <span className="relative block min-w-0 flex-1">
              <span
                aria-hidden
                className={cn(
                  textClass,
                  'invisible block',
                  wrapText ? 'whitespace-pre-wrap' : 'whitespace-pre',
                )}
              >
                {`${shown}\u200b`}
              </span>
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                aria-label={`${label} input`}
                data-testid={`${label} input`}
                value={current}
                rows={1}
                onBlur={enableViewMode}
                onKeyPress={handleKeyPress}
                onChange={handleChange}
                className={cn(
                  fieldClass,
                  'absolute inset-0 h-full w-full resize-none overflow-hidden',
                )}
              />
            </span>
          ) : (
            <span className="relative inline-block max-w-full min-w-[1ch]">
              <span
                aria-hidden
                className={cn(textClass, 'invisible whitespace-pre')}
              >
                {`${shown}\u00a0`}
              </span>
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                aria-label={`${label} input`}
                data-testid={`${label} input`}
                value={current}
                size={1}
                onBlur={enableViewMode}
                onKeyPress={handleKeyPress}
                onChange={handleChange}
                className={cn(fieldClass, 'absolute inset-0 h-full w-full')}
              />
            </span>
          )}
          <Pencil className="size-3.5 shrink-0 opacity-0" />
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
