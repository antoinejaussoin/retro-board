import { useState, useCallback, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { colors } from '@mui/material';
import { Edit } from '@mui/icons-material';
import TextareaAutosize from 'react-autosize-textarea'; // Really need to replace this dependency

const TextareaAutosizeAny = TextareaAutosize as any;

interface EditableLabelProps extends CenteredProp {
  value: string;
  readOnly?: boolean;
  placeholder?: string;
  multiline?: boolean;
  label?: string;
  focused?: boolean;
  wrapText?: boolean;
  onChange: (value: string) => void;
}

interface CenteredProp {
  centered?: boolean;
}

const EditableLabel = ({
  value,
  readOnly,
  placeholder,
  multiline,
  label,
  focused,
  wrapText = false,
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
    [onChange, current]
  );
  const handleChange = useCallback(
    (event: React.FormEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setCurrent(event.currentTarget.value);
    },
    []
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

  return (
    <LabelContainer>
      {editMode ? (
        <EditMode>
          {multiline ? (
            <TextareaAutosizeAny
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              aria-label={`${label} input`}
              data-testid={`${label} input`}
              value={current}
              onBlur={enableViewMode}
              onKeyPress={handleKeyPress}
              onChange={handleChange}
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
            />
          )}
          <InvisibleEditIcon fontSize="inherit" />
        </EditMode>
      ) : readOnly ? (
        <ViewMode wrapText={wrapText} aria-label={label}>
          <span>{current || placeholder}</span>
        </ViewMode>
      ) : (
        <ViewMode wrapText={wrapText} onClick={enableEditMode}>
          <span aria-label={label} data-testid={label}>
            {current || placeholder}
          </span>
          &nbsp;
          <EditIcon fontSize="inherit" style={{ fontSize: '0.8em' }} />
        </ViewMode>
      )}
    </LabelContainer>
  );
};

export default EditableLabel;

const LabelContainer = styled.span``;

const ViewMode = styled.span<{ wrapText: boolean }>`
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  > span {
    white-space: ${(props) => (props.wrapText ? 'pre-wrap' : 'nowrap')};
    line-height: 1.5;
  }

  &:hover {
    > svg {
      color: ${colors.purple[500]};
      cursor: pointer;
    }
  }
`;

const EditMode = styled.span<CenteredProp>`
  display: inline-flex;
  width: 100%;
  margin: 0 auto;
  padding: 0;

  textarea,
  input {
    flex: 1;
    font-family: inherit;
    font-weight: inherit;
    letter-spacing: inherit;
    width: 100%;
    background: none;
    border: none;
    outline: none;
    font-size: inherit;
    text-align: ${(props) => (props.centered ? 'center' : 'inherit')};
    padding: 0;
    line-height: 1.5;
  }
`;

const EditIcon = styled(Edit)`
  position: relative;
  top: 2px;
  color: ${colors.grey[500]};
`;

const InvisibleEditIcon = styled(EditIcon)`
  opacity: 0;
  margin-left: 6px;
`;
