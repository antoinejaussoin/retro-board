import { QueryClientProvider } from '@tanstack/react-query';
import QuotaManager from './auth/QuotaManager';
import AuthProvider from './auth/AuthProvider';
import { FullScreenLoader } from 'components/loaders/FullScreenLoader';
import { Suspense } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { CodeSplitLoader } from './CodeSplitLoader';
import ErrorBoundary from './ErrorBoundary';
import Layout from './Layout';
import { queryClient } from './queryClient';
import './Theme';
import LanguageProvider from './translations/LanguageProvider';
import { ConfirmProvider } from 'ui/confirm';
import { Toaster } from 'ui/toast';
import { TooltipProvider } from 'ui/tooltip';

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Suspense fallback={<FullScreenLoader />}>
            <Helmet>
              <meta property="og:title" content="Retrospected.com" />
              <meta
                property="og:description"
                content="Real-time Agile Retrospective Board for development teams"
              />
              <meta property="og:url" content="https://app.retrospected.com" />
            </Helmet>
            <Toaster />
            <ConfirmProvider>
              <BrowserRouter>
                <AuthProvider>
                  <LanguageProvider>
                    <QuotaManager>
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
          </Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
