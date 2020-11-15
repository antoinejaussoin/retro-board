import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/styles';
import { Helmet } from 'react-helmet';
import GlobalStyles from './GlobalStyles';
import AuthProvider from './auth/AuthProvider';
import LanguageProvider from './translations/LanguageProvider';
import theme from './Theme';
import { Provider as StateContext } from './state';
import Layout from './Layout';
import ErrorBoundary from './ErrorBoundary';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import config from './utils/getConfig';
import { SnackbarProvider } from 'notistack';

const stripePromise = loadStripe(config.StripeKey);

function App() {
  return (
    <Elements stripe={stripePromise}>
      <Helmet>
        <meta property="og:title" content="Retrospected.com" />
        <meta
          property="og:description"
          content="Real-time Agile Retrospective Board for development teams"
        />
        <meta property="og:url" content="https://www.retrospected.com" />
      </Helmet>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <ThemeProvider theme={theme}>
          <BrowserRouter>
            <AuthProvider>
              <LanguageProvider>
                <StateContext>
                  <GlobalStyles />
                  <ErrorBoundary>
                    <Layout />
                  </ErrorBoundary>
                </StateContext>
              </LanguageProvider>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </SnackbarProvider>
    </Elements>
  );
}

export default App;
