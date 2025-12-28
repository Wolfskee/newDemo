// 后端 API 基础 URL
const isDev = process.env.NODE_ENV === 'development';

export const API_BASE_URL = isDev
  ? (process.env.NEXT_PUBLIC_API_URL_DEV || 'http://127.0.0.1:3001')
  : (process.env.NEXT_PUBLIC_API_URL || '/api');

export const apiUrl = (endpoint: string) => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const base = API_BASE_URL.endsWith('/')
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;

  return `${base}/${cleanEndpoint}`;
};
