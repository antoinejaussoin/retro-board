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
import { SnackbarProvider } from 'notistack';
import useIsLicenced from './hooks/useIsLicenced';
import { Alert, AlertTitle } from '@material-ui/lab';
import { RecoilRoot } from 'recoil';

function App() {
  const licenced = useIsLicenced();
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
            <AuthProvider>
              <LanguageProvider>
                <StateContext>
                  <GlobalStyles />
                  <ErrorBoundary>
                    {!licenced ? (
                      <Alert title="Unlicenced" severity="error">
                        <AlertTitle>Retrospected is Unlicenced</AlertTitle>
                        This software is unlicenced. Please contact{' '}
                        <a href="mailto:support@retrospected.com">
                          support@retrospected.com
                        </a>{' '}
                        to obtain a licence.
                      </Alert>
                    ) : null}
                    <Layout />
                  </ErrorBoundary>
                </StateContext>
              </LanguageProvider>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </SnackbarProvider>
    </RecoilRoot>
  );
}

export default App;
