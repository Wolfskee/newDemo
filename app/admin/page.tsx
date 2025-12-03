"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Select,
  SelectItem,
  Link,
} from "@nextui-org/react";
import NextLink from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "employee">("admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // If user is already logged in as admin/employee, redirect to dashboard
    if (user && (user.role === "admin" || user.role === "employee")) {
      router.push("/admin/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate authentication
    // In production, this would be a real API call
    setTimeout(() => {
      // For demo: accept any email/password for admin/employee
      // In production, validate against database
      const adminEmails = ["admin@example.com", "admin@company.com"];
      const employeeEmails = ["employee@example.com", "employee@company.com"];

      const isAdmin =
        role === "admin" && adminEmails.includes(email.toLowerCase());
      const isEmployee =
        role === "employee" && employeeEmails.includes(email.toLowerCase());

      if (isAdmin || isEmployee || email.includes("@")) {
        // Store admin/employee session
        const userData = {
          email,
          role: role,
        };
        localStorage.setItem("adminUser", JSON.stringify(userData));
        router.push("/admin/dashboard");
      } else {
        setError("Invalid credentials for " + role);
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 items-center pt-8">
          <h1 className="text-3xl font-bold">Admin Portal</h1>
          <p className="text-gray-500">Sign in as Admin or Employee</p>
        </CardHeader>
        <CardBody className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Login As"
              selectedKeys={[role]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setRole(selected as "admin" | "employee");
              }}
              fullWidth
            >
              <SelectItem key="admin" value="admin">
                Admin
              </SelectItem>
              <SelectItem key="employee" value="employee">
                Employee
              </SelectItem>
            </Select>
            <Input
              label="Email"
              type="email"
              placeholder={`Enter your ${role} email`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
            {error && (
              <p className="text-danger text-sm text-center">{error}</p>
            )}
            <div className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 p-3 rounded">
              <p className="font-semibold mb-1">Demo Credentials:</p>
              <p>Admin: admin@example.com</p>
              <p>Employee: employee@example.com</p>
              <p className="mt-2 text-xs">(Any password works for demo)</p>
            </div>
            <Button
              type="submit"
              color="primary"
              fullWidth
              size="lg"
              isLoading={loading}
            >
              Sign In as {role === "admin" ? "Admin" : "Employee"}
            </Button>
            <div className="text-center">
              <Button
                as={NextLink}
                href="/"
                variant="light"
                size="sm"
                className="text-gray-500"
              >
                ← Back to Home
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
