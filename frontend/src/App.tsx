import { BrowserRouter } from 'react-router-dom';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import { Helmet } from 'react-helmet';
import GlobalStyles from './GlobalStyles';
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
import GlobalProvider from './global/GlobalProvider';

function App() {
  return (
    <RecoilRoot>
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
            <GlobalProvider>
              <AuthProvider>
                <LanguageProvider>
                  <QuotaManager>
                    <GlobalStyles />
                    <ErrorBoundary>
                      <Suspense fallback={<CodeSplitLoader />}>
                        <Layout />
                      </Suspense>
                    </ErrorBoundary>
                  </QuotaManager>
                </LanguageProvider>
              </AuthProvider>
            </GlobalProvider>
          </BrowserRouter>
        </ThemeProvider>
      </SnackbarProvider>
    </RecoilRoot>
  );
}

export default App;
