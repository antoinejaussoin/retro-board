import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/styles';
import GlobalStyles from './GlobalStyles';
import { LanguageContext } from './translations';
import theme from './Theme';
import { Provider as StateContext } from './state';
import Layout from './Layout';

function App() {
  const [language, setLanguage] = useState('en');
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <LanguageContext.Provider value={{ language, setLanguage }}>
          <StateContext>
            <GlobalStyles />
            <Layout />
          </StateContext>
        </LanguageContext.Provider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
