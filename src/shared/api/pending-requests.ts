import { useSyncExternalStore } from 'react';

let pendingCount = 0;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return (): void => {
    listeners.delete(listener);
  };
}

function getSnapshot(): number {
  return pendingCount;
}

/**
 * 標記一筆進行中的 API 請求。由 Axios interceptor 呼叫。
 */
export function beginRequest(): void {
  pendingCount += 1;
  emit();
}

/**
 * 結束一筆 API 請求（成功或失敗都要呼叫）。
 */
export function endRequest(): void {
  pendingCount = Math.max(0, pendingCount - 1);
  emit();
}

/**
 * 訂閱目前尚未完成的 API 請求數量。
 */
export function usePendingRequestCount(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
