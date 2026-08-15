import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { attachAuthInterceptors } from './features/auth/utils/attach-interceptors';
import { attachPendingInterceptors } from './shared/api/attach-pending-interceptors';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement === null) {
  throw new Error('找不到 root 元素');
}

attachAuthInterceptors();
attachPendingInterceptors();

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
