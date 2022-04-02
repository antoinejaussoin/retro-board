import 'core-js/stable';
import 'whatwg-fetch';
import App from './App';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initialiseAnalytics, initialiseSentry } from './track';
import * as serviceWorker from './serviceWorker';
import 'emoji-mart/css/emoji-mart.css';

(window as any).global = window;
// @ts-ignore
window.Buffer = window.Buffer || require('buffer').Buffer;

initialiseSentry();
initialiseAnalytics();

const container = document.getElementById('content')!;
const root = createRoot(container);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
