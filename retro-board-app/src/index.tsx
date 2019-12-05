import 'core-js/stable';
import 'react-hot-loader';
import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/browser';
import App from './App';
import { initialiseAnalytics } from './track';
import * as serviceWorker from './serviceWorker';

Sentry.init({
  dsn: 'https://3191cb1f4ae444ab94614d5e1aa5157d@sentry.io/1846621',
});
initialiseAnalytics();
ReactDOM.render(<App />, document.getElementById('content'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
