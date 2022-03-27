import { lazy, Suspense, useCallback, useState } from 'react';
import styled from '@emotion/styled';
import Typography from '@mui/material/Typography';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import EditableLabel from '../../../../components/EditableLabel';
import { ColumnSettings } from '../../../../state/types';
import { TwitterPicker, ColorResult } from 'react-color';
import IconButton from '@mui/material/IconButton';
import { colors } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { DeleteForeverOutlined } from '@mui/icons-material';

const IconPicker = lazy(
  () => import('./IconPicker' /* webpackChunkName: "icon-picker" */)
);

interface ColumnEditorProps {
  value: ColumnSettings;
  canDelete: boolean;
  onChange: (value: ColumnSettings) => void;
  onRemove: (value: ColumnSettings) => void;
}

const ColumnEditor = ({
  value,
  canDelete,
  onChange,
  onRemove,
}: ColumnEditorProps) => {
  const fullScreen = useMediaQuery('(max-width:600px)');
  const [pickerOpen, setPickerOpen] = useState(false);
  const openPicker = useCallback(() => setPickerOpen(true), []);
  const closePicker = useCallback(() => setPickerOpen(false), []);
  const handleLabelChange = useCallback(
    (label: string) => {
      onChange({
        ...value,
        label,
      });
    },
    [onChange, value]
  );
  const handleColorChange = useCallback(
    (result: ColorResult) => {
      onChange({
        ...value,
        color: result.hex,
      });
      closePicker();
    },
    [onChange, value, closePicker]
  );

  const handleIconChange = useCallback(
    (icon: string) => {
      onChange({
        ...value,
        icon,
      });
    },
    [onChange, value]
  );
  const handleRemove = useCallback(() => {
    onRemove(value);
  }, [value, onRemove]);
  return (
    <Container>
      <ColorAndIconContainer>
        <ColorContainer>
          <ColorPickerValue
            color={value.color}
            onClick={pickerOpen ? closePicker : openPicker}
          />
          {pickerOpen && (
            <ClickAwayListener onClickAway={closePicker}>
              <PickerContainer>
                <TwitterPicker
                  colors={[
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
                  ]}
                  triangle="hide"
                  color={value.color}
                  onChange={handleColorChange}
                ></TwitterPicker>
              </PickerContainer>
            </ClickAwayListener>
          )}
        </ColorContainer>
        <IconContainer>
          <Suspense fallback={<span />}>
            <IconPicker value={value.icon} onChange={handleIconChange} />
          </Suspense>
        </IconContainer>
        {fullScreen && canDelete ? (
          <DeleteContainer>
            <IconButton onClick={handleRemove} size="large">
              <DeleteForeverOutlined />
            </IconButton>
          </DeleteContainer>
        ) : null}
      </ColorAndIconContainer>
      <LabelContainer>
        <Typography>
          <EditableLabel
            value={value.label}
            onChange={handleLabelChange}
            placeholder={value.label || '(empty)'}
          />
        </Typography>
      </LabelContainer>
      {!fullScreen && canDelete ? (
        <DeleteContainer>
          <IconButton onClick={handleRemove} size="large">
            <DeleteForeverOutlined />
          </IconButton>
        </DeleteContainer>
      ) : null}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 0;
  width: 100%;
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const DeleteContainer = styled.div`
  svg {
    color: ${colors.red[500]};
  }
`;

const LabelContainer = styled.div`
  flex: 1;
`;

const ColorPickerValue = styled.div<{ color: string }>`
  width: 24px;
  height: 24px;
  box-shadow: 2px 2px 5px 2px rgba(224, 224, 224, 1);
  background-color: ${(props) => props.color};
  cursor: pointer;
`;

const PickerContainer = styled.div`
  position: absolute;
  left: 0px;
  top: -100px;
  z-index: 9999;
`;

const ColorContainer = styled.div`
  position: relative;
  margin-right: 20px;
`;

const IconContainer = styled.div`
  margin-right: 20px;
`;

const ColorAndIconContainer = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 600px) {
    margin-bottom: 15px;
  }
`;

export default ColumnEditor;
