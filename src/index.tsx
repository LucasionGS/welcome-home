import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Setup from './Setup';

const setupPhase = window.location.pathname.startsWith("/setup");

ReactDOM.render(
  <React.StrictMode>
    {
      setupPhase ? <Setup /> : <App />
    }
  </React.StrictMode>,
  document.getElementById('root')
);
