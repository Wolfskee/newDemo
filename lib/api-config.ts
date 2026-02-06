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

  // Next.js API 路由（以 api/ 开头）使用包含 BASE_PATH 的路径
  if (endpoint.startsWith('api/') || endpoint.startsWith('/api/')) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const basePath = BASE_PATH ? (BASE_PATH.startsWith('/') ? BASE_PATH : `/${BASE_PATH}`) : '';
    return basePath ? `${basePath}${cleanEndpoint}` : cleanEndpoint;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const base = API_BASE_URL.endsWith('/')
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;

  // 如果 API_BASE_URL 是相对路径 (如 /api)，也需要考虑 BASE_PATH
  // 但通常 process.env.NEXT_PUBLIC_API_URL 应该配置为完整路径或者不需要 /demo 前缀的路径
  // 如果这里也加上 /demo，可能会导致双重前缀或者代理问题
  // 暂时保持原样，只对明确的 api/ 路由添加前缀

  return `${base}/${cleanEndpoint}`;
};

