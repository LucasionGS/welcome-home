import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import Setup from './Setup';

const setupPhase = window.location.pathname.startsWith("/setup");

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {
      setupPhase ? <Setup /> : <App />
    }
  </React.StrictMode>,
);
