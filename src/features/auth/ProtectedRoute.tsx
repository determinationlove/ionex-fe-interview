import { type ReactElement } from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from './auth-store';

/**
 * 未登入時導回登入頁；工作階段恢復中先不導頁；已登入則渲染子路由。
 */
export function ProtectedRoute(): ReactElement | null {
  const session = useAuthStore((state) => state.session);

  if (session.status === 'IDLE' || session.status === 'LOADING') {
    return null;
  }

  if (session.status !== 'AUTHENTICATED') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
