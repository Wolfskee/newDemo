"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types/api";
import { setTokens, clearTokens, getAccessToken, getRefreshToken, refreshAccessToken } from "@/lib/api-client";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  setAuthTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 初始化时检查 token 并尝试刷新
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const refreshToken = getRefreshToken();

        // 如果有 refreshToken，尝试刷新 token
        if (refreshToken) {
          const newTokens = await refreshAccessToken();
          if (newTokens) {
            // 刷新成功
            setIsAuthenticated(true);
            // 注意：refresh API 可能不返回用户信息，用户信息需要从其他地方获取
          } else {
            // 刷新失败，清除 tokens
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          // 没有 refreshToken，检查是否有 accessToken
          const accessToken = getAccessToken();
          if (accessToken) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 监听登出事件
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      clearTokens();
      setIsAuthenticated(false);
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, []);

  const setAuthTokens = (accessToken: string, refreshToken: string) => {
    setTokens(accessToken, refreshToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    clearTokens();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        setAuthTokens,
        logout,
        loading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
