import { css } from '@emotion/react';

const GlobalStyle = css`
  @font-face {
    font-family: 'DIGITALDREAM';
    src: url('/fonts/digital/DIGITALDREAM.woff2') format('woff2');
  }

  html {
    touch-action: manipulation;
    font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
  }

  body {
    margin: 0;
    padding: 0;
    background-color: white;
    font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
  }

  #content {
    background-color: white;
  }

  button:focus,
  select:focus {
    outline: none;
  }
`;

export default GlobalStyle;
