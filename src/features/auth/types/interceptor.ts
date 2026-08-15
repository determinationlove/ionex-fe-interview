import type { InternalAxiosRequestConfig } from 'axios';

export type RetryConfig = InternalAxiosRequestConfig & { retried?: boolean };
