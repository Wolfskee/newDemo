"use client";

import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import { useRouter } from "next/navigation";

interface AdminUser {
  email: string;
  role: string; // 改为 string 以支持 "ADMIN" 或 "admin"
}

interface QuickActionsCardProps {
  adminUser: AdminUser;
}

export default function QuickActionsCard({ adminUser }: QuickActionsCardProps) {
  const router = useRouter();
  
  // 检查是否为 ADMIN（忽略大小写）
  const isAdmin = adminUser.role?.toUpperCase() === "ADMIN";

  return (
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
        {isAdmin && (
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
  );
}
