import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import './styles/creative.css';
import './styles/services.css';
import './styles/pages.css';
import './styles/showcase.css';
import './styles/motion.css';
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
