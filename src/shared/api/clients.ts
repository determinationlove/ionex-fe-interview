import axios from 'axios';

const apiBaseUrl = ((): string => {
  const url = import.meta.env.VITE_API_BASE_URL;
  if (typeof url !== 'string' || url.length === 0) {
    throw new Error('缺少 VITE_API_BASE_URL');
  }
  return url;
})();

export const appClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const publicClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});
