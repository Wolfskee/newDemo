"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from "@nextui-org/react";

interface AdminUser {
  email: string;
  role: "admin" | "employee";
}

export default function AdminDashboard() {
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
            <Card key={index}>
              <CardBody>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {stat.label}
                </p>
                <p className={`text-3xl font-bold text-${stat.color} mt-2`}>
                  {stat.value}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold">Recent Orders</h2>
            </CardHeader>
            <CardBody>
              <Table aria-label="Recent orders table">
                <TableHeader>
                  <TableColumn>ID</TableColumn>
                  <TableColumn>CUSTOMER</TableColumn>
                  <TableColumn>PRODUCT</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.product}</TableCell>
                      <TableCell>
                        <Chip
                          color={
                            order.status === "Completed"
                              ? "success"
                              : order.status === "Pending"
                              ? "warning"
                              : "primary"
                          }
                          size="sm"
                        >
                          {order.status}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold">Quick Actions</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Button
                color="primary"
                fullWidth
                variant="flat"
                onPress={() => router.push("/admin/products")}
              >
                Manage Products
              </Button>
              <Button
                color="secondary"
                fullWidth
                variant="flat"
                onPress={() => router.push("/admin/services")}
              >
                Manage Services
              </Button>
              <Button
                color="success"
                fullWidth
                variant="flat"
                onPress={() => router.push("/admin/users")}
              >
                View Users
              </Button>
              {adminUser.role === "admin" && (
                <Button
                  color="warning"
                  fullWidth
                  variant="flat"
                  onPress={() => router.push("/admin/employees")}
                >
                  Manage Employees
                </Button>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
