// 后端 API 基础 URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.143.74.213:3001/';

// API 端点辅助函数
export const apiUrl = (endpoint: string) => {
  // 如果 endpoint 已经包含完整 URL，直接返回
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  // 移除开头的斜杠（如果有）
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  // 确保 BASE_URL 末尾没有斜杠，然后添加斜杠和 endpoint
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  console.log(`${baseUrl}/${cleanEndpoint}`);
  return `${baseUrl}/${cleanEndpoint}`;
};
