import axios from 'axios';

export type ApiErrorBody = {
  message: string;
  code?: string;
};

type AppErrorOptions = {
  status?: number;
  code?: string;
  cause?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * 檢查值是否為 API 錯誤物件（至少有字串 message）。
 */
export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (!isRecord(value) || typeof value.message !== 'string') {
    return false;
  }
  if (value.code !== undefined && typeof value.code !== 'string') {
    return false;
  }
  return true;
}

/**
 * 是否為 access token 過期（401 + TOKEN_EXPIRED），這是唯一會觸發 refresh 的情況。
 */
export function isTokenExpiredError(value: unknown): boolean {
  return isApiErrorBody(value) && value.code === 'TOKEN_EXPIRED';
}

/**
 * 應用程式錯誤。API、網路與工作階段失敗都轉成這個型別後再交給 UI。
 */
export class AppError extends Error {
  readonly status: number | undefined;
  readonly code: string | undefined;

  constructor(message: string, options?: AppErrorOptions) {
    super(message, { cause: options?.cause });
    this.name = 'AppError';
    this.status = options?.status;
    this.code = options?.code;
  }
}

function messageFromApi(status: number, body: ApiErrorBody): string {
  if (body.code === 'INVALID_REFRESH_TOKEN' || body.code === 'REFRESH_TOKEN_EXPIRED') {
    return '工作階段已失效，請重新登入';
  }
  if (body.code === 'INVALID_TOKEN') {
    return '登入狀態無效，請重新登入';
  }
  if (body.code === 'TOKEN_EXPIRED') {
    return '登入已過期';
  }
  if (status === 401) {
    return '帳號或密碼不正確';
  }
  if (status === 415) {
    return '請求格式必須為 JSON';
  }
  if (status === 400) {
    return '請求內容不正確';
  }
  if (status >= 500) {
    return '伺服器發生錯誤，請稍後再試';
  }
  return '請求失敗，請稍後再試';
}

/**
 * 把未知錯誤轉成 AppError，供頁面顯示。不記錄原始請求或 token。
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    if (error.code === 'ERR_CANCELED') {
      return new AppError('請求已取消', { code: 'CANCELED', cause: error });
    }
    if (error.response === undefined) {
      return new AppError('網路連線失敗，請稍後再試', { code: 'NETWORK', cause: error });
    }

    const status = error.response.status;
    const body = error.response.data;
    if (isApiErrorBody(body)) {
      return new AppError(messageFromApi(status, body), {
        status,
        code: body.code,
        cause: error,
      });
    }
    if (status >= 500) {
      return new AppError('伺服器發生錯誤，請稍後再試', { status, cause: error });
    }
    return new AppError('請求失敗，請稍後再試', { status, cause: error });
  }

  return new AppError('發生未預期的錯誤', { cause: error });
}
