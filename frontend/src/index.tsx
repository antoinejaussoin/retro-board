import 'core-js/stable';
import 'whatwg-fetch';
import ReactDOM from 'react-dom';
import './translations/i18n';
import App from './App';
import { initialiseAnalytics, initialiseSentry } from './track';
import * as serviceWorker from './serviceWorker';
import 'emoji-mart/css/emoji-mart.css';

// window.process = {
//   env: import.meta.env,
// } as any;

window.module = {
  hot: false,
} as any;

(window as any).global = window;
// @ts-ignore
// window.Buffer = window.Buffer || require('buffer').Buffer;

initialiseSentry();
initialiseAnalytics();
ReactDOM.render(<App />, document.getElementById('content'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
