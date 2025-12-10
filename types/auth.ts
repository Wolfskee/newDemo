// 认证用户接口（简化版，用于 AuthContext）
export interface AuthUser {
  email: string;
  role?: "user" | "admin" | "employee";
}

// 认证上下文类型
export interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}
