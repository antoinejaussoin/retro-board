import { useCallback } from 'react';
import { getIcon, getAllIcons } from '../../../../state/icons';
import { IconName } from 'common';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { SelectChangeEvent } from '@mui/material';

interface IconPickerProps {
  value: IconName | string | null;
  onChange: (value: IconName) => void;
}

const IconPicker = ({ value, onChange }: IconPickerProps) => {
  const icons = getAllIcons();
  const handleChange = useCallback(
    (event: SelectChangeEvent<IconName | string>) => {
      onChange(event.target.value as IconName);
    },
    [onChange]
  );
  const actualValue: IconName | string = value || 'help';
  return (
    <Select
      value={actualValue}
      renderValue={renderIcon}
      onChange={handleChange}
      variant="standard"
    >
      {icons.map((icon) => {
        return (
          <MenuItem value={icon} key={icon}>
            {getIcon(icon as IconName)}
          </MenuItem>
        );
      })}
    </Select>
  );
};

function renderIcon(icon: unknown): React.ReactNode {
  return icon ? getIcon(icon as IconName) : null;
}

export default IconPicker;
