
"use client";

import { apiUrl } from "./api-config";

// Token 存储键
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

// Token 管理函数
export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// 刷新 token
let isRefreshing = false;
let refreshPromise: Promise<{ accessToken: string; refreshToken: string } | null> | null = null;

export const refreshAccessToken = async (): Promise<{ accessToken: string; refreshToken: string } | null> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      const response = await fetch(apiUrl("auth/refresh"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${refreshToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.accessToken && data.refreshToken) {
          setTokens(data.accessToken, data.refreshToken);
          return {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          };
        }
      }
      
      // 刷新失败，清除 tokens
      clearTokens();
      return null;
    } catch (error) {
      console.error("Error refreshing token:", error);
      clearTokens();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// API 请求函数
interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean; // 是否跳过认证（用于登录、注册等）
}

export const apiRequest = async <T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<Response> => {
  const { skipAuth = false, headers = {}, ...fetchOptions } = options;

  // 构建请求头 - 使用 Record<string, string> 类型以支持动态属性
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  // 如果不是跳过认证的请求，添加 access token
  if (!skipAuth) {
    const accessToken = getAccessToken();
    if (accessToken) {
      requestHeaders["Authorization"] = `Bearer ${accessToken}`;
    } else {
      // Token 不存在，记录警告
      console.warn("No access token found for authenticated request to:", endpoint);
      // 如果 token 不存在，可能需要重新登录
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
    }
  }

  // 发送请求
  let response = await fetch(apiUrl(endpoint), {
    ...fetchOptions,
    headers: requestHeaders,
  });

  // 如果返回 401 且不是跳过认证的请求，尝试刷新 token
  if (response.status === 401 && !skipAuth) {
    const newTokens = await refreshAccessToken();
    
    if (newTokens) {
      // 使用新的 token 重试请求
      requestHeaders["Authorization"] = `Bearer ${newTokens.accessToken}`;
      response = await fetch(apiUrl(endpoint), {
        ...fetchOptions,
        headers: requestHeaders,
      });
    } else {
      // 刷新失败，可能需要重新登录
      // 这里可以触发登出逻辑
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
    }
  }

  return response;
};

// 便捷方法
export const apiGet = <T = any>(
  endpoint: string, 
  options?: ApiRequestOptions & { params?: Record<string, string | number> }
): Promise<T> => {
  // 如果有查询参数，构建查询字符串
  let url = endpoint;
  if (options?.params) {
    const queryString = new URLSearchParams(
      Object.entries(options.params).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    url = `${endpoint}?${queryString}`;
  }

  const { params, ...restOptions } = options || {};
  return apiRequest<T>(url, { ...restOptions, method: "GET" }).then(async (res) => {
    if (!res.ok) {
      // 检查响应是否有内容
      const contentType = res.headers.get("content-type");
      const contentLength = res.headers.get("content-length");
      
      let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      
      // 只有当响应是 JSON 格式时才尝试解析
      if (contentType && contentType.includes("application/json") && contentLength !== "0") {
        try {
          const errorText = await res.text();
          if (errorText) {
            try {
              const error = JSON.parse(errorText);
              errorMessage = error.message || error.error || errorMessage;
            } catch {
              // 如果不是有效的 JSON，使用原始文本
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (e) {
          // 如果读取失败，使用默认错误消息
          console.error("Failed to read error response:", e);
        }
      }
      
      throw new Error(errorMessage);
    }
    
    // 检查响应是否有内容
    const contentLength = res.headers.get("content-length");
    if (contentLength === "0") {
      return {} as T;
    }
    
    try {
      const text = await res.text();
      if (!text) {
        return {} as T;
      }
      return JSON.parse(text) as T;
    } catch (e) {
      console.error("Failed to parse response as JSON:", e);
      return {} as T;
    }
  });
};

export const apiPost = <T = any>(
  endpoint: string,
  data?: any,
  options?: ApiRequestOptions
): Promise<T> => {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  }).then(async (res) => {
    if (!res.ok) {
      // 检查响应是否有内容
      const contentType = res.headers.get("content-type");
      const contentLength = res.headers.get("content-length");
      
      let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      
      // 只有当响应是 JSON 格式时才尝试解析
      if (contentType && contentType.includes("application/json") && contentLength !== "0") {
        try {
          const errorText = await res.text();
          if (errorText) {
            try {
              const error = JSON.parse(errorText);
              errorMessage = error.message || error.error || errorMessage;
            } catch {
              // 如果不是有效的 JSON，使用原始文本
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (e) {
          // 如果读取失败，使用默认错误消息
          console.error("Failed to read error response:", e);
        }
      }
      
      throw new Error(errorMessage);
    }
    
    // 处理 204 No Content 响应
    if (res.status === 204) {
      return {} as T;
    }
    
    // 检查响应是否有内容
    const contentLength = res.headers.get("content-length");
    const contentType = res.headers.get("content-type");
    
    // 如果内容长度为 0，返回空对象
    if (contentLength === "0") {
      return {} as T;
    }
    
    // 尝试读取并解析响应
    try {
      const text = await res.text();
      
      // 如果响应体为空，返回空对象
      if (!text || text.trim() === "") {
        return {} as T;
      }
      
      // 尝试解析为 JSON
      try {
        return JSON.parse(text) as T;
      } catch (parseError) {
        // 如果不是有效的 JSON，返回空对象（或者可以根据需要返回文本）
        console.warn("Response is not valid JSON:", text);
        return {} as T;
      }
    } catch (readError) {
      // 如果读取响应失败，返回空对象
      console.error("Failed to read response:", readError);
      return {} as T;
    }
  });
};

export const apiPut = <T = any>(
  endpoint: string,
  data?: any,
  options?: ApiRequestOptions
): Promise<T> => {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  }).then(async (res) => {
    if (!res.ok) {
      // 检查响应是否有内容
      const contentType = res.headers.get("content-type");
      const contentLength = res.headers.get("content-length");
      
      let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      
      // 只有当响应是 JSON 格式时才尝试解析
      if (contentType && contentType.includes("application/json") && contentLength !== "0") {
        try {
          const errorText = await res.text();
          if (errorText) {
            try {
              const error = JSON.parse(errorText);
              errorMessage = error.message || error.error || errorMessage;
            } catch {
              // 如果不是有效的 JSON，使用原始文本
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (e) {
          // 如果读取失败，使用默认错误消息
          console.error("Failed to read error response:", e);
        }
      }
      
      throw new Error(errorMessage);
    }
    
    // 检查响应是否有内容
    const contentLength = res.headers.get("content-length");
    if (contentLength === "0") {
      return {} as T;
    }
    
    try {
      const text = await res.text();
      if (!text) {
        return {} as T;
      }
      return JSON.parse(text) as T;
    } catch (e) {
      console.error("Failed to parse response as JSON:", e);
      return {} as T;
    }
  });
};

export const apiDelete = <T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> => {
  return apiRequest<T>(endpoint, { ...options, method: "DELETE" }).then(async (res) => {
    if (!res.ok) {
      // 检查响应是否有内容
      const contentType = res.headers.get("content-type");
      const contentLength = res.headers.get("content-length");
      
      let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      
      // 只有当响应是 JSON 格式时才尝试解析
      if (contentType && contentType.includes("application/json") && contentLength !== "0") {
        try {
          const errorText = await res.text();
          if (errorText) {
            try {
              const error = JSON.parse(errorText);
              errorMessage = error.message || error.error || errorMessage;
            } catch {
              // 如果不是有效的 JSON，使用原始文本
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (e) {
          // 如果读取失败，使用默认错误消息
          console.error("Failed to read error response:", e);
        }
      }
      
      throw new Error(errorMessage);
    }
    
    // DELETE 可能返回空响应
    if (res.status === 204 || res.headers.get("content-length") === "0") {
      return {} as T;
    }
    
    // 检查响应是否有内容
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return {} as T;
    }
    
    try {
      const text = await res.text();
      if (!text) {
        return {} as T;
      }
      return JSON.parse(text) as T;
    } catch (e) {
      console.error("Failed to parse response as JSON:", e);
      return {} as T;
    }
  });
};

// 文件上传函数（使用 FormData）
export const apiUploadFile = async <T = any>(
  endpoint: string,
  file: File,
  options?: ApiRequestOptions & { fieldName?: string }
): Promise<T> => {
  const { skipAuth = false, fieldName = "file", ...restOptions } = options || {};
  
  // 创建 FormData
  const formData = new FormData();
  formData.append(fieldName, file);

  // 构建请求头 - 文件上传时不要设置 Content-Type，让浏览器自动设置 boundary
  const requestHeaders: Record<string, string> = {};
  
  // 如果不是跳过认证的请求，添加 access token
  if (!skipAuth) {
    const accessToken = getAccessToken();
    if (accessToken) {
      requestHeaders["Authorization"] = `Bearer ${accessToken}`;
    }
  }

  // 发送请求的辅助函数
  const sendUploadRequest = (headers: Record<string, string>): Promise<Response> => {
    // 重新创建 FormData 以确保可以多次使用
    const uploadFormData = new FormData();
    uploadFormData.append(fieldName, file);
    
    return fetch(apiUrl(endpoint), {
      ...restOptions,
      method: "POST",
      body: uploadFormData,
      headers: headers,
    });
  };

  // 首次发送请求
  let response = await sendUploadRequest(requestHeaders);

  // 如果返回 401 且不是跳过认证的请求，尝试刷新 token
  if (response.status === 401 && !skipAuth) {
    const newTokens = await refreshAccessToken();
    
    if (newTokens) {
      // 使用新的 token 重试请求
      requestHeaders["Authorization"] = `Bearer ${newTokens.accessToken}`;
      response = await sendUploadRequest(requestHeaders);
    } else {
      // 刷新失败，可能需要重新登录
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
    }
  }

  // 处理响应
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Upload failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  // 处理 201 或其他成功状态码，可能没有响应体
  if (response.status === 201 || response.status === 204) {
    const contentLength = response.headers.get("content-length");
    if (contentLength === "0" || !contentLength) {
      return {} as T;
    }
  }

  // 尝试解析 JSON，如果失败则返回空对象
  try {
    return await response.json();
  } catch {
    return {} as T;
  }
};