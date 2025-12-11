"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Link,
} from "@nextui-org/react";
import NextLink from "next/link";
import { apiUrl } from "@/lib/api-config";
import { User } from "@/types/api";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(apiUrl("auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      if (response.status === 200) {
        // 登录成功，获取用户信息
        const userData: User = await response.json();
        
        // 验证用户角色是否为管理员或员工
        const userRole = userData.role?.toUpperCase();
        if (userRole !== "ADMIN" && userRole !== "EMPLOYEE") {
          setError("This account is not authorized to access the admin portal.");
          setLoading(false);
          return;
        }

        // 存储管理员/员工会话信息（仅用于前端路由保护）
        const adminUserData = {
          email: userData.email,
          role: userData.role,
        };
        localStorage.setItem("adminUser", JSON.stringify(adminUserData));
        
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        // 登录失败
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      // 检查是否是网络错误
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError("Unable to connect to server. Please check your internet connection or try again later.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 items-center pt-8">
          <h1 className="text-3xl font-bold">Admin Portal</h1>
          <p className="text-gray-500">Sign in to access admin dashboard</p>
        </CardHeader>
        <CardBody className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
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
            <Button
              type="submit"
              color="primary"
              fullWidth
              size="lg"
              isLoading={loading}
            >
              Sign In
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
