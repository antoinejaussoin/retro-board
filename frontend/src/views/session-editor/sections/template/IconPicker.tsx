import { useCallback } from 'react';
import { getIcon, getAllIcons } from '../../../../state/icons';
import { IconName } from 'common';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { SelectChangeEvent } from '@mui/material';

interface IconPickerProps {
  value: IconName | null;
  onChange: (value: IconName) => void;
}

const IconPicker = ({ value, onChange }: IconPickerProps) => {
  const icons = getAllIcons();
  const handleChange = useCallback(
    (event: SelectChangeEvent<IconName>) => {
      onChange(event.target.value as IconName);
    },
    [onChange]
  );
  const actualValue: IconName = value || 'help';
  return (
    <Select
      value={actualValue}
      renderValue={renderIcon}
      onChange={handleChange}
      variant="standard"
    >
      {icons.map((icon) => {
        const AnIcon = getIcon(icon)!;
        return (
          <MenuItem value={icon} key={icon}>
            <AnIcon />
          </MenuItem>
        );
      })}
    </Select>
  );
};

function renderIcon(icon: unknown): React.ReactNode {
  const Icon = getIcon(icon as IconName);
  return Icon ? <Icon /> : null;
}

export default IconPicker;
