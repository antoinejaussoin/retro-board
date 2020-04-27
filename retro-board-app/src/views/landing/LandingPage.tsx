import React from 'react';
import styled from 'styled-components';

const isDev = process.env.NODE_ENV !== 'production';

const LandingPage = () => {
  return null;
  return (
    <Container>
      {isDev ? (
        <div>Home Page Placeholder.</div>
      ) : (
        <iframe
          src="/homepage/index.html"
          title="Retrospected's homepage content"
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  height: 100vh;
  width: 100%;
  iframe {
    height: 100vh;
    width: 100%;
    border: none;
  }
`;

export default LandingPage;
