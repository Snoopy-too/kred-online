import React from 'react';
import ReactDOM from 'react-dom/client';
import { LobbyProvider } from './src/contexts/LobbyContext';
import KredApp from './src/KredApp';
import './src/config/i18n';
import './src/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LobbyProvider>
      <KredApp />
    </LobbyProvider>
  </React.StrictMode>
);