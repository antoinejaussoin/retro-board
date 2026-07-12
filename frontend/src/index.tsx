import 'core-js/stable';
import 'whatwg-fetch';
import { createRoot } from 'react-dom/client';
import './translations/i18n';
import App from './App';
import { initialiseAnalytics, initialiseSentry } from './track';
import * as serviceWorker from './serviceWorker';
import 'emoji-mart/css/emoji-mart.css';

// Hack because a dependency requires module.hot to be defined
window.module = {
  hot: false,
} as any;

(window as any).global = window;

const container = document.getElementById('content');
const root = createRoot(container!);

initialiseSentry();
initialiseAnalytics();

root.render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
