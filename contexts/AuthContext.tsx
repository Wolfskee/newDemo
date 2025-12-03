"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  email: string;
  role?: "user" | "admin" | "employee";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call - in production, this would be a real API endpoint
    // For demo purposes, we'll accept any email/password combination
    const userData: User = {
      email,
      role: "user",
    };
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    return true;
  };

  const register = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    // Simulate API call
    const userData: User = {
      email,
      role: "user",
    };
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
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
