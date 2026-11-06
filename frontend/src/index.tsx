import '@fontsource-variable/plus-jakarta-sans';
import { createRoot } from 'react-dom/client';
import './index.css';
import './translations/i18n';
import App from './App';
import { initialiseAnalytics, initialiseSentry } from './track';
import * as serviceWorker from './serviceWorker';

const container = document.getElementById('content');
const root = createRoot(container!);

initialiseSentry();
initialiseAnalytics();

root.render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
