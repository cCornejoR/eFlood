import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'sonner';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
    <Toaster
      theme='dark'
      position='top-right'
      toastOptions={{
        style: {
          background: 'rgba(31, 41, 55, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#ffffff',
        },
      }}
    />
  </React.StrictMode>
);
