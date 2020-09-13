import React, { useCallback } from 'react';
import styled from 'styled-components';
import { Select, MenuItem } from '@material-ui/core';
import { languages } from '../translations';
import 'flag-icon-css/css/flag-icon.min.css';

interface LanguagePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const LanguagePicker = ({ value, onChange }: LanguagePickerProps) => {
  const handleSelect = useCallback(
    (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
      const language = event.target.value as string;
      onChange(language);
    },
    [onChange]
  );
  return (
    <StyledSelect value={value} onChange={handleSelect}>
      {languages.map(language => (
        <MenuItem value={language.value} key={language.value}>
          <LanguageItem>
            <Flag className={`flag-icon flag-icon-${language.iso}`}>
              <FlagOverlay />
            </Flag>
            <Names>
              <Name>{language.name}</Name>
              <EnglishName>{language.englishName}</EnglishName>
            </Names>
          </LanguageItem>
        </MenuItem>
      ))}
    </StyledSelect>
  );
};

const StyledSelect = styled(Select)`
  width: 250px;
`;

const LanguageItem = styled.div`
  display: flex;
  align-items: center;
`;

const Flag = styled.div`
  font-size: 32px;
  margin-left: 10px;
  height: 32px;
  margin-right: 8px;
  position: relative;
`;

const FlagOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 32px;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.5) 0%,
    rgba(255, 255, 255, 0) 100%
  );
`;
const Names = styled.div`
  margin-left: 5px;
  display: flex;
  flex-direction: column;
  font-size: 0.8em;
`;
const Name = styled.div``;
const EnglishName = styled.div`
  color: grey;
`;

export default LanguagePicker;
