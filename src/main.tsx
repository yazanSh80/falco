import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { DataProvider } from './state/DataContext';
import { ToastProvider } from './components/ui/toast';
import { EffectsProvider } from './utils/EffectsContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <EffectsProvider>
        <DataProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </DataProvider>
      </EffectsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
