// 后端 API 基础 URL
const isDev = process.env.NODE_ENV === 'development';
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const API_BASE_URL = isDev
  ? (process.env.NEXT_PUBLIC_API_URL_DEV || 'http://127.0.0.1:3001')
  : (process.env.NEXT_PUBLIC_API_URL || '/api');

export const apiUrl = (endpoint: string) => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  // 只针对 /api/send-email 追加 BASE_PATH
  if (endpoint === 'api/send-email' || endpoint === '/api/send-email') {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const basePath = BASE_PATH ? (BASE_PATH.startsWith('/') ? BASE_PATH : `/${BASE_PATH}`) : '';
    return basePath ? `${basePath}${cleanEndpoint}` : cleanEndpoint;
  }

  // Next.js API 路由（以 api/ 开头）使用相对路径
  if (endpoint.startsWith('api/') || endpoint.startsWith('/api/')) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return cleanEndpoint;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const base = API_BASE_URL.endsWith('/')
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;

  return `${base}/${cleanEndpoint}`;
};
