import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { startAuthCoordinator } from './features/auth/utils/auth-coordinator';
import { attachAuthInterceptors } from './features/auth/utils/attach-interceptors';
import { attachPendingInterceptors } from './shared/api/attach-pending-interceptors';
import { queryClient } from './shared/query/query-client';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement === null) {
  throw new Error('找不到 root 元素');
}

attachAuthInterceptors();
attachPendingInterceptors();
startAuthCoordinator();

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
