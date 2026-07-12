import { BrowserRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Global } from '@emotion/react';
import { ThemeProvider } from '@mui/material';
import globalCss from './GlobalStyles';
import AuthProvider from './auth/AuthProvider';
import LanguageProvider from './translations/LanguageProvider';
import theme from './Theme';
import Layout from './Layout';
import ErrorBoundary from './ErrorBoundary';
import { SnackbarProvider } from 'notistack';
import { RecoilRoot } from 'recoil';
import { Suspense } from 'react';
import { CodeSplitLoader } from './CodeSplitLoader';
import QuotaManager from './auth/QuotaManager';
import { ConfirmProvider } from 'material-ui-confirm';
import { FullScreenLoader } from 'components/loaders/FullScreenLoader';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <RecoilRoot>
        <Suspense fallback={<FullScreenLoader />}>
          <Helmet>
            <meta property="og:title" content="Retrospected.com" />
            <meta
              property="og:description"
              content="Real-time Agile Retrospective Board for development teams"
            />
            <meta property="og:url" content="https://app.retrospected.com" />
          </Helmet>
          <SnackbarProvider
            maxSnack={3}
            autoHideDuration={3000}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
          >
            <ConfirmProvider>
              <BrowserRouter>
                <AuthProvider>
                  <LanguageProvider>
                    <QuotaManager>
                      <Global styles={globalCss} />
                      <ErrorBoundary>
                        <Suspense fallback={<CodeSplitLoader />}>
                          <Layout />
                        </Suspense>
                      </ErrorBoundary>
                    </QuotaManager>
                  </LanguageProvider>
                </AuthProvider>
              </BrowserRouter>
            </ConfirmProvider>
          </SnackbarProvider>
        </Suspense>
      </RecoilRoot>
    </ThemeProvider>
  );
}

export default App;
