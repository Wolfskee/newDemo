
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

const refreshAccessToken = async (): Promise<{ accessToken: string; refreshToken: string } | null> => {
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
export const apiGet = <T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> => {
  return apiRequest<T>(endpoint, { ...options, method: "GET" }).then(async (res) => {
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || `HTTP ${res.status}`);
    }
    return res.json();
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
      const error = await res.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || `HTTP ${res.status}`);
    }
    return res.json();
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
      const error = await res.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || `HTTP ${res.status}`);
    }
    return res.json();
  });
};

export const apiDelete = <T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> => {
  return apiRequest<T>(endpoint, { ...options, method: "DELETE" }).then(async (res) => {
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || `HTTP ${res.status}`);
    }
    // DELETE 可能返回空响应
    if (res.status === 204 || res.headers.get("content-length") === "0") {
      return {} as T;
    }
    return res.json();
  });
};