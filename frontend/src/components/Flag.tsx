import styled from '@emotion/styled';
import 'flag-icons/css/flag-icons.min.css';

type FlagProps = {
  country: string;
};

export function Flag({ country }: FlagProps) {
  return (
    <FlagIcon className={`fi fi-${country}`}>
      <FlagOverlay />
    </FlagIcon>
  );
}

const FlagIcon = styled.div`
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
