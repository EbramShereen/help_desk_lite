import 'reflect-metadata';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './lib/i18n';
import App from './App.tsx';
import { store } from './app/store';
import { queryClient } from './lib/queryClient';
import { DependencyProvider } from './core/di';
import { AppThemeProvider } from './core/theme/AppThemeProvider';
import { AuthBootstrap } from './features/auth/logic/AuthBootstrap';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <DependencyProvider>
          <AppThemeProvider>
            <AuthBootstrap>
              <BrowserRouter basename="/help_desk_lite">
                <App />
              </BrowserRouter>
            </AuthBootstrap>
          </AppThemeProvider>
        </DependencyProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);
