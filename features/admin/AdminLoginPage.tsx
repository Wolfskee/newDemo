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
} from "@heroui/react";
import NextLink from "next/link";
import { apiPost } from "@/lib/api-client";
import { User, AuthResponse } from "@/types/api";
import { setTokens } from "@/lib/api-client";

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
      const authData: AuthResponse = await apiPost<AuthResponse>(
        "auth/login",
        {
          email: email.trim(),
          password: password,
        },
        { skipAuth: true }
      );

      // 验证用户角色是否为管理员或员工
      const userRole = authData.user?.role?.toUpperCase();
      if (userRole !== "ADMIN" && userRole !== "EMPLOYEE") {
        setError("This account is not authorized to access the admin portal.");
        setLoading(false);
        return;
      }

      // 保存 tokens
      if (authData.accessToken && authData.refreshToken) {
        setTokens(authData.accessToken, authData.refreshToken);
      }

      // 存储管理员/员工会话信息（包括 id，用于获取 appointment）
      const adminUserData = {
        id: authData.user?.id || "",
        email: authData.user?.email || email.trim(),
        role: authData.user?.role || "",
      };
      localStorage.setItem("adminUser", JSON.stringify(adminUserData));

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Admin login error:", err);
      if (err instanceof Error) {
        setError(err.message);
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
