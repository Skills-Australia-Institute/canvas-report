import '@radix-ui/themes/styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { APP } from './constants.ts';
import './index.css';

const favicon = document.getElementById('favicon') as HTMLLinkElement;

if (APP === 'stanley') {
  document.title = 'Stanley College';
  favicon.href = '/stanley.ico';
} else {
  document.title = 'Skills Australia';
  favicon.href = '/sai.ico';
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
