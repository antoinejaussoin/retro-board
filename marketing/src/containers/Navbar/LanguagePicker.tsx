import { useRouter } from 'next/router';
import { useState, MouseEvent as ReactMouseEvent } from 'react';
import { CircleFlag } from 'react-circle-flags';
import styled from 'styled-components';

const mappings: Record<string, string> = {
  en: 'gb',
};

export function LanguagePicker({}: {}) {
  const { locale, locales, asPath } = useRouter();
  const [open, setOpen] = useState(false);

  const handleChange = (
    e: ReactMouseEvent<HTMLImageElement, MouseEvent>,
    loc: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);

    window.location.href = `/${loc}${asPath}`;
  };

  if (!locale || !locales) return null;

  return (
    <Container onClick={() => setOpen((o) => !o)}>
      <CircleFlag
        countryCode={mappings[locale] ?? locale}
        height={35}
        width={35}
      />
      <Hover open={open}>
        {locales.map((lang) => (
          <CircleFlag
            key={lang}
            countryCode={mappings[lang] ?? lang}
            height="35"
            onClick={(e) => handleChange(e, lang)}
          />
        ))}
      </Hover>
    </Container>
  );
}
const Hover = styled.div<{ open: boolean }>`
  display: ${(p) => (p.open ? 'flex' : 'none')};

  padding: 10px;
  flex-direction: column;
  gap: 5px;
  position: absolute;
  left: -10px;
  top: 50px;
  background-color: white;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em,
    rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em,
    rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset;
`;
const Container = styled.div`
  position: relative;
  cursor: pointer;
`;
