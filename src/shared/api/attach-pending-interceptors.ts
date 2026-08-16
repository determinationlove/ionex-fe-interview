import type { AxiosInstance, AxiosResponse } from 'axios';
import { publicClient } from './clients';
import { beginRequest, endRequest } from './pending-requests';

let attached = false;

function attachToClient(client: AxiosInstance): void {
  client.interceptors.request.use(
    (config) => {
      beginRequest();
      return config;
    },
    (error: unknown) => {
      endRequest();
      return Promise.reject(error);
    },
  );

  client.interceptors.response.use(
    (response: AxiosResponse) => {
      endRequest();
      return response;
    },
    (error: unknown) => {
      endRequest();
      return Promise.reject(error);
    },
  );
}

/**
 * 為 publicClient 追蹤進行中請求（登入／refresh）。只應呼叫一次。
 * 受保護請求改由 Query 狀態呈現，避免切頁被全螢幕遮罩蓋住。
 */
export function attachPendingInterceptors(): void {
  if (attached) {
    return;
  }
  attached = true;
  attachToClient(publicClient);
}
