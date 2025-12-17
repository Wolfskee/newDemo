// Item 接口（通用，用于 product 和 service）
export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  duration?: number;
  category?: string;
  status?: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

// 产品接口（duration === 0 的 Item）
export interface Product extends Item {
  // Product 特有字段可以在这里添加
}

// 服务接口（duration !== 0 的 Item）
export interface Service extends Item {
  // Service 特有字段可以在这里添加
}

// 预约接口（根据新API文档更新）
export interface Appointment {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO 格式，包含日期和时间
  status: string; // PENDING, CONFIRMED, CANCELLED 等
  customerId: string;
  employeeId: string;
  createdAt: string;
  updatedAt: string;
}

// 预约列表分页响应接口
export interface AppointmentListResponse {
  appointments: Appointment[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// 预订接口（保留用于向后兼容，但建议使用 Appointment）
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

// Item 列表分页响应接口
export interface ItemListResponse {
  items: Item[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// 认证响应接口
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: User; // 某些 API 可能同时返回用户信息
}
