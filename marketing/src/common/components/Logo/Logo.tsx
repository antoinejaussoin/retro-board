import { CSSProperties } from 'react';
import styled from 'styled-components';
import NextImage from '../NextImage';
import logoColor from './logo-color.png';
import logoText from './text-black.png';

type LogoProps = {
  inverse?: boolean;
  short?: boolean;
  size: number;
  style?: CSSProperties;
};

export function Logo({ inverse, short, size, style }: LogoProps) {
  return (
    <Container style={style}>
      <NextImage src={logoColor} alt="Logo" width={size} height={size} />
      {!short ? (
        <NextImage src={logoText} alt="Retrospected" height={(size / 3) * 2} />
      ) : null}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
`;
