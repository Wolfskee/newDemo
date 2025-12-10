"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/react";
import StatsCard from "./components/StatsCard";
import RecentOrdersCard from "./components/RecentOrdersCard";
import QuickActionsCard from "./components/QuickActionsCard";

interface AdminUser {
  email: string;
  role: "admin" | "employee";
}

export default function AdminDashboardPage() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for admin session
    const stored = localStorage.getItem("adminUser");
    if (stored) {
      setAdminUser(JSON.parse(stored));
    } else {
      router.push("/admin");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    router.push("/admin");
  };

  if (!adminUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Mock data for dashboard
  const stats = [
    { label: "Total Products", value: "24", color: "primary" },
    { label: "Total Services", value: "8", color: "secondary" },
    { label: "Active Users", value: "156", color: "success" },
    { label: "Orders Today", value: "12", color: "warning" },
  ];

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
