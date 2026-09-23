import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import App from './App';
import { PrefsProvider } from './i18n/PrefsContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PrefsProvider>
      <App />
    </PrefsProvider>
  </React.StrictMode>
);
