import { type ReactElement } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { LoginPage } from '@/features/auth/LoginPage';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { NotFoundPage } from '@/features/not-found/NotFoundPage';
import { UsersPage } from '@/features/users/UsersPage';

/**
 * 應用程式路由表。
 */
export function AppRoutes(): ReactElement {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/users" element={<UsersPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/users" replace />} /> // 跳轉到 users 頁面
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
