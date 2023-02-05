import 'core-js/stable';
import 'whatwg-fetch';
import ReactDOM from 'react-dom';
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

initialiseSentry();
initialiseAnalytics();
ReactDOM.render(<App />, document.getElementById('content'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
