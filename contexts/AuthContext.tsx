"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types/api";
import { setTokens, clearTokens, getAccessToken } from "@/lib/api-client";

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

  // 检查是否有 token（用于判断是否已登录）
  useEffect(() => {
    const token = getAccessToken();
    setIsAuthenticated(!!token);
    setLoading(false);
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
