// 后端 API 基础 URL
const isDev = process.env.NODE_ENV === 'development';

// 获取基础路径（用于子路径部署，如 /demo）
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

// 计算 API_BASE_URL
// 如果设置了 NEXT_PUBLIC_API_URL，使用它（可能是完整 URL 或相对路径）
// 否则，如果有 BASE_PATH，使用 ${BASE_PATH}/api，否则使用 /api
const getApiBaseUrl = () => {
  if (isDev) {
    return process.env.NEXT_PUBLIC_API_URL_DEV || 'http://127.0.0.1:3001';
  }
  
  const customApiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (customApiUrl) {
    return customApiUrl;
  }
  
  // 如果没有设置 NEXT_PUBLIC_API_URL，根据 BASE_PATH 决定
  if (BASE_PATH) {
    const basePath = BASE_PATH.startsWith('/') ? BASE_PATH : `/${BASE_PATH}`;
    return `${basePath}/api`;
  }
  
  return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

export const apiUrl = (endpoint: string) => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  // Next.js API 路由（以 api/ 开头）使用相对路径
  if (endpoint.startsWith('api/') || endpoint.startsWith('/api/')) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    // 如果有基础路径，添加前缀
    if (BASE_PATH) {
      const basePath = BASE_PATH.startsWith('/') ? BASE_PATH : `/${BASE_PATH}`;
      return `${basePath}${cleanEndpoint}`;
    }
    return cleanEndpoint;
  }

  // 外部 API（不以 api/ 开头），使用 API_BASE_URL
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const base = API_BASE_URL.endsWith('/')
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;

  return `${base}/${cleanEndpoint}`;
};
