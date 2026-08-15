import type { AxiosInstance, AxiosResponse } from 'axios';
import { appClient, publicClient } from './clients';
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
 * 為所有 API client 追蹤進行中請求。只應呼叫一次，且須在 auth interceptor 之後掛上。
 */
export function attachPendingInterceptors(): void {
  if (attached) {
    return;
  }
  attached = true;
  attachToClient(appClient);
  attachToClient(publicClient);
}
