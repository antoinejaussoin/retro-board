import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { initialiseAnalytics } from './track';
import * as serviceWorker from './serviceWorker';

initialiseAnalytics();
ReactDOM.render(<App />, document.getElementById('content'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
