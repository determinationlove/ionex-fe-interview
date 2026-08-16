import type { UserStatus, UsersQueryParams } from '../types';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;
export const LIMIT_OPTIONS = [10, 20, 50] as const;

/**
 * 將 URL 中的字串轉成大於 0 的整數；缺值或格式錯誤時使用 fallback。
 */
function parsePositiveInt(value: string | null, fallback: number): number {
  if (value === null || value.trim() === '') {
    return fallback;
  }
  const normalized = value.trim();
  if (!/^\d+$/.test(normalized)) {
    return fallback;
  }
  const parsed = Number(normalized);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}

/**
 * 只接受 API 支援的使用者狀態，其他字串視為未指定篩選條件。
 */
function parseStatus(value: string | null): UserStatus | undefined {
  if (value === 'active' || value === 'inactive') {
    return value;
  }
  return undefined;
}

/**
 * 清除文字參數前後空白；空字串不送給 API。
 */
function parseOptionalText(value: string | null): string | undefined {
  if (value === null) {
    return undefined;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  return trimmed;
}

/**
 * 將 URL search params 轉成 API query 使用的型別。
 * URL 是篩選與分頁的唯一來源，因此所有缺值、錯誤值都在這裡統一套用預設。
 */
export function parseUsersSearchParams(searchParams: URLSearchParams): UsersQueryParams {
  const page = parsePositiveInt(searchParams.get('page'), DEFAULT_PAGE);
  let limit = parsePositiveInt(searchParams.get('limit'), DEFAULT_LIMIT);
  if (limit > MAX_LIMIT) {
    limit = DEFAULT_LIMIT;
  }

  return {
    page,
    limit,
    name: parseOptionalText(searchParams.get('name')),
    email: parseOptionalText(searchParams.get('email')),
    status: parseStatus(searchParams.get('status')),
  };
}

/**
 * 將已驗證的查詢條件轉回 canonical URL search params。
 * 預設值不寫進 URL，讓相同狀態只會有一種網址表示方式。
 */
export function serializeUsersSearchParams(params: UsersQueryParams): URLSearchParams {
  const next = new URLSearchParams();
  if (params.page !== DEFAULT_PAGE) {
    next.set('page', String(params.page));
  }
  if (params.limit !== DEFAULT_LIMIT) {
    next.set('limit', String(params.limit));
  }
  if (params.name !== undefined) {
    next.set('name', params.name);
  }
  if (params.email !== undefined) {
    next.set('email', params.email);
  }
  if (params.status !== undefined) {
    next.set('status', params.status);
  }
  return next;
}
