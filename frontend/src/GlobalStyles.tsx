import { css } from '@emotion/react';
import { tokens } from './tokens';

const GlobalStyle = css`
  @font-face {
    font-family: 'DIGITALDREAM';
    src: url('/fonts/digital/DIGITALDREAM.woff2') format('woff2');
  }

  html {
    touch-action: manipulation;
    font-family: ${tokens.font};
    background-color: ${tokens.canvas};
  }

  body {
    margin: 0;
    padding: 0;
    background-color: ${tokens.canvas};
    color: ${tokens.ink};
    font-family: ${tokens.font};
  }

  #content {
    background-color: ${tokens.canvas};
  }

  button:focus,
  select:focus {
    outline: none;
  }

  button:focus-visible,
  select:focus-visible,
  a:focus-visible,
  [role='button']:focus-visible {
    outline: 2px solid var(--rs-accent);
    outline-offset: 2px;
  }
`;

export default GlobalStyle;
