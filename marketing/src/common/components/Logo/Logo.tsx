import styled from 'styled-components';
import NextImage from '../NextImage';
import logoColor from './logo-color.png';
import logoText from './text-black.png';

type SafeNumber = number | `${number}`;

type LogoProps = {
  inverse?: boolean;
  short?: boolean;
  size: number;
};

export function Logo({ inverse, short, size }: LogoProps) {
  return (
    <Container>
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
