import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ContentProvider } from './hooks/useContent.jsx';
import { ToastProvider } from './hooks/useToast.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import './styles/base.css';
import './styles/site.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ContentProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </ContentProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
