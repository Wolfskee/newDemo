// 产品接口
export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

// 服务接口
export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  image?: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

// 预订接口
export interface Booking {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  service: string;
  description?: string;
  createdAt: string;
}

// 用户接口（根据新API文档更新）
export interface User {
  id: string;
  username: string;
  email: string;
  role: "CUSTOMER" | "ADMIN" | string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

// 用户列表分页响应接口
export interface UserListResponse {
  users: User[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// 员工接口（与 User 相同，但语义上用于员工）
export interface Employee extends User {
  // 可以添加员工特有的字段
}

// 管理员用户接口（用于 admin 登录）
export interface AdminUser {
  email: string;
  role: "admin" | "employee";
}
