import { appClient } from '@/shared/api/clients';
import { AppError, toAppError } from '@/shared/api/error-type';
import type { UsersApiResponse, UsersApiUser, UsersQueryParams, UsersResult } from '../types';

/**
 * 確認 unknown 是非 null 物件，後續才能安全檢查欄位。
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * 驗證 API 陣列中的單一使用者是否具有所有必要欄位。
 */
function isUsersApiUser(value: unknown): value is UsersApiUser {
  if (!isRecord(value)) {
    return false;
  }
  if (typeof value.id !== 'number' || !Number.isFinite(value.id)) {
    return false;
  }
  if (typeof value.name !== 'string') {
    return false;
  }
  if (typeof value.email !== 'string') {
    return false;
  }
  if (typeof value.avatar !== 'string') {
    return false;
  }
  if (typeof value.status !== 'string') {
    return false;
  }
  if (typeof value.created_at !== 'string') {
    return false;
  }
  return true;
}

/**
 * 驗證 users API 的列表與 pagination 結構。
 * 即使 HTTP request 成功，也要防止格式錯誤的 JSON 進入 UI。
 */
function isUsersResponse(value: unknown): value is UsersApiResponse {
  if (!isRecord(value) || !Array.isArray(value.data) || !isRecord(value.pagination)) {
    return false;
  }
  if (!value.data.every(isUsersApiUser)) {
    return false;
  }
  const pagination = value.pagination;
  if (typeof pagination.total !== 'number' || !Number.isFinite(pagination.total)) {
    return false;
  }
  if (typeof pagination.current_page !== 'number' || !Number.isFinite(pagination.current_page)) {
    return false;
  }
  if (typeof pagination.per_page !== 'number' || !Number.isFinite(pagination.per_page)) {
    return false;
  }
  if (typeof pagination.total_pages !== 'number' || !Number.isFinite(pagination.total_pages)) {
    return false;
  }
  return true;
}

/**
 * 將 API 的 snake_case response 轉成頁面使用的 camelCase model。
 */
function mapUsersResponse(data: UsersApiResponse): UsersResult {
  return {
    users: data.data.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      status: user.status,
      createdAt: user.created_at,
    })),
    pagination: {
      total: data.pagination.total,
      currentPage: data.pagination.current_page,
      perPage: data.pagination.per_page,
      totalPages: data.pagination.total_pages,
    },
  };
}

/**
 * 以已驗證的查詢條件向 `/api/users` 取得資料。
 * 未指定的 filter 不放進 query string；response 通過 runtime guard 後才映射成前端 model。
 */
export async function fetchUsers(params: UsersQueryParams): Promise<UsersResult> {
  const query: Record<string, string | number> = {
    page: params.page,
    limit: params.limit,
  };
  if (params.name !== undefined) {
    query.name = params.name;
  }
  if (params.email !== undefined) {
    query.email = params.email;
  }
  if (params.status !== undefined) {
    query.status = params.status;
  }

  try {
    const { data } = await appClient.get<unknown>('/api/users', { params: query });
    if (!isUsersResponse(data)) {
      throw new AppError('使用者列表回應格式不正確');
    }
    return mapUsersResponse(data);
  } catch (error) {
    throw toAppError(error);
  }
}
