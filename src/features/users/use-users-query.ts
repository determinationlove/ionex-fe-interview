import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { AppError } from '@/shared/api/error-type';
import type { UsersQueryParams, UsersResult } from './types';
import { fetchUsers } from './utils/users-api';

/**
 * 以 typed params 查詢使用者列表。不讀 Router，切頁時保留上一頁資料。
 * TanStack Query 的 signal 會一路傳給 Axios，讓 query 被清除時能取消實際 HTTP request。
 */
export function useUsersQuery(params: UsersQueryParams): UseQueryResult<UsersResult, AppError> {
  return useQuery({
    queryKey: ['users', params],
    queryFn: ({ signal }): Promise<UsersResult> => fetchUsers(params, signal),
    placeholderData: keepPreviousData,
  });
}
