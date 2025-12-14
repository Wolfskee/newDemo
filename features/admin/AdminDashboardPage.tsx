"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/react";
import StatsCard from "./components/StatsCard";
import RecentOrdersCard from "./components/RecentOrdersCard";
import QuickActionsCard from "./components/QuickActionsCard";
import { apiUrl } from "@/lib/api-config";
import { ItemListResponse } from "@/types/api";

interface AdminUser {
  email: string;
  role: string; // 改为 string 以支持 "ADMIN" 或 "admin"
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
  const router = useRouter();

  useEffect(() => {
    // Check for admin session
    const stored = localStorage.getItem("adminUser");
    if (stored) {
      setAdminUser(JSON.parse(stored));
      fetchStats();
    } else {
      router.push("/admin");
    }
  }, [router]);

  const fetchStats = async () => {
    try {
      // 获取 items 数据
      const response = await fetch(apiUrl("item"));
      
      if (!response.ok) {
        throw new Error("Failed to fetch items");
      }

      const data: ItemListResponse = await response.json();
      const totalItems = data.total || 0;
      
      // 计算 products 数量（duration === 0 或未定义）
      const productsCount = (data.items || []).filter(
        (item) => !item.duration || item.duration === 0
      ).length;
      
      // 计算 services 数量（total - products）
      const servicesCount = totalItems - productsCount;

      // 更新 stats
      setStats([
        { label: "Total Products", value: productsCount.toString(), color: "primary" },
        { label: "Total Services", value: servicesCount.toString(), color: "secondary" },
        { label: "Active Users", value: "0", color: "success" }, // 暂时保持为 0，可以后续连接用户 API
        { label: "Orders Today", value: "0", color: "warning" }, // 暂时保持为 0，可以后续连接订单 API
      ]);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    router.push("/admin");
  };

  if (!adminUser || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

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
              Admin Dashboard
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentOrdersCard orders={recentOrders} />
          <QuickActionsCard adminUser={adminUser} />
        </div>
      </div>
    </div>
  );
}
