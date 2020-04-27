import 'core-js/stable';
import 'whatwg-fetch';
import 'react-hot-loader';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { initialiseAnalytics, initialiseSentry } from './track';
import * as serviceWorker from './serviceWorker';

initialiseSentry();
initialiseAnalytics();
ReactDOM.render(<App />, document.getElementById('content'), () => {
  console.log('React loaded');
  Array.prototype.forEach.call(
    document.querySelectorAll('link[rel=stylesheet].marketing'),
    function (element) {
      try {
        element.parentNode.removeChild(element);
      } catch (err) {}
    }
  );
  Array.prototype.forEach.call(
    document.querySelectorAll('script.marketing'),
    function (element) {
      try {
        element.parentNode.removeChild(element);
      } catch (err) {}
    }
  );
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
