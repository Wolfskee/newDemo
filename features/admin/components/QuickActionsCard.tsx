"use client";

import { Card, CardBody, CardHeader, Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";

interface AdminUser {
  email: string;
  role: "admin" | "employee";
}

interface QuickActionsCardProps {
  adminUser: AdminUser;
}

export default function QuickActionsCard({ adminUser }: QuickActionsCardProps) {
  const router = useRouter();

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
        <Button
          color="warning"
          fullWidth
          variant="flat"
          onPress={() => router.push("/admin/employees")}
        >
          Manage Employees
        </Button>
      </CardBody>
    </Card>
  );
}
