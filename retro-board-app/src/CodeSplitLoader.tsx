import CircularProgress from '@material-ui/core/CircularProgress';
import styled from 'styled-components';

export function CodeSplitLoader() {
  return (
    <Center>
      <CircularProgress />
    </Center>
  );
}

const Center = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;
