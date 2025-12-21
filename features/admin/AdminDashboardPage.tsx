"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import StatsCard from "./components/StatsCard";
import RecentOrdersCard from "./components/RecentOrdersCard";
import QuickActionsCard from "./components/QuickActionsCard";
import BookingCalendar from "@/components/BookingCalendar";
import { apiGet } from "@/lib/api-client";
import { clearTokens } from "@/lib/api-client";
import { ItemListResponse, AppointmentListResponse, Appointment, UserListResponse } from "@/types/api";

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export default function AdminDashboardPage() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [stats, setStats] = useState([
    { label: "Total Products", value: "0", color: "primary" },
    { label: "Total Services", value: "0", color: "secondary" },
    { label: "Active Users", value: "0", color: "success" },
    { label: "Orders Today", value: "0", color: "warning" },
  ]);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Check for admin session
    const stored = localStorage.getItem("adminUser");
    if (stored) {
      const user = JSON.parse(stored);
      setAdminUser(user);
      fetchStats();
      
      // 如果是 employee，获取 appointment
      if (user.role === "EMPLOYEE" || user.role === "employee") {
        fetchAppointments(user.id);
      }
    } else {
      router.push("/admin");
    }
  }, [router]);

  const fetchStats = async () => {
    try {
      // 并行获取 items 和 users 数据
      const [itemsData, usersData] = await Promise.all([
        apiGet<ItemListResponse>("item"),
        apiGet<UserListResponse>("user"),
      ]);
      
      const totalItems = itemsData.total || 0;
      
      // 计算 products 数量（duration === 0 或未定义）
      const productsCount = (itemsData.items || []).filter(
        (item) => !item.duration || item.duration === 0
      ).length;
      
      // 计算 services 数量（total - products）
      const servicesCount = totalItems - productsCount;

      // 计算 CUSTOMER 用户数量
      const customersCount = (usersData.users || []).filter(
        (user) => user.role === "CUSTOMER" || user.role === "customer"
      ).length;

      // 更新 stats
      setStats([
        { label: "Total Products", value: productsCount.toString(), color: "primary" },
        { label: "Total Services", value: servicesCount.toString(), color: "secondary" },
        { label: "Active Users", value: customersCount.toString(), color: "success" },
        { label: "Orders Today", value: "0", color: "warning" }, // 暂时保持为 0，可以后续连接订单 API
      ]);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setLoading(false);
    }
  };

  const fetchAppointments = async (employeeId: string) => {
    try {
      const data: AppointmentListResponse = await apiGet<AppointmentListResponse>("appointment");
      // 过滤出当前 employee 的 appointment
      const employeeAppointments = (data.appointments || []).filter(
        (apt) => apt.employeeId === employeeId
      );
      setAppointments(employeeAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    clearTokens(); // 清除 JWT tokens
    router.push("/admin");
  };

  if (!adminUser || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const isEmployee = adminUser.role === "EMPLOYEE" || adminUser.role === "employee";

  const recentOrders = [
    { id: 1, customer: "John Doe", product: "Premium Product 1", status: "Completed", date: "2024-01-15" },
    { id: 2, customer: "Jane Smith", product: "Premium Product 2", status: "Pending", date: "2024-01-15" },
    { id: 3, customer: "Bob Johnson", product: "Consulting Service", status: "In Progress", date: "2024-01-14" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {isEmployee ? "Employee Dashboard" : "Admin Dashboard"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Welcome, {adminUser.email} ({adminUser.role})
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              color="default"
              variant="flat"
              onPress={() => router.push("/")}
            >
              Home
            </Button>
            <Button color="danger" variant="flat" onPress={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              label={stat.label}
              value={stat.value}
              color={stat.color}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RecentOrdersCard orders={recentOrders} />
          <QuickActionsCard adminUser={adminUser} />
        </div>

        {/* My Appointments Section - 仅对 employee 显示 */}
        {isEmployee && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              My Appointments
            </h2>
            <BookingCalendar appointments={appointments} />
          </div>
        )}
      </div>
    </div>
  );
}
