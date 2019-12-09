import { hot } from 'react-hot-loader/root';
import { TrackingEvent } from 'retro-board-common';
import { setConfig } from 'react-hot-loader';
import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/styles';
import GlobalStyles from './GlobalStyles';
import { LanguageContext } from './translations';
import theme from './Theme';
import { Provider as StateContext } from './state';
import Layout from './Layout';
import ErrorBoundary from './ErrorBoundary';
import { getItem } from './utils/localStorage';
import { trackEvent } from './track';

setConfig({
  reloadHooks: false,
});

function App() {
  const [language, setLanguage] = useState('en');
  useEffect(() => {
    const language = getItem('language');
    if (language) {
      trackEvent(`language/change/${language}` as TrackingEvent);
      setLanguage(language);
    }
  }, []);
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <LanguageContext.Provider value={{ language, setLanguage }}>
          <StateContext>
            <GlobalStyles />
            <ErrorBoundary>
              <Layout />
            </ErrorBoundary>
          </StateContext>
        </LanguageContext.Provider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default hot(App);
