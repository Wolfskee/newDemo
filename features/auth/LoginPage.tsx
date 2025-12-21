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
import { apiPost } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { User, AuthResponse } from "@/types/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser, setAuthTokens } = useAuth();

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

      // 保存 tokens
      if (authData.accessToken && authData.refreshToken) {
        setAuthTokens(authData.accessToken, authData.refreshToken);
      }

      // 如果有用户信息，保存用户信息
      if (authData.user) {
        setUser(authData.user);
      } else {
        // 如果没有用户信息，可能需要单独获取
        // 这里假设登录响应包含用户信息，如果没有则需要额外请求
        // 暂时使用一个占位符用户对象
        setUser({
          id: "",
          username: email.trim(),
          email: email.trim(),
          role: "CUSTOMER",
          phone: "",
          createdAt: "",
          updatedAt: "",
        });
      }

      // 根据角色跳转
      const userRole = authData.user?.role?.toUpperCase();
      if (userRole === "ADMIN" || userRole === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
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
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 items-center pt-8">
          <h1 className="text-3xl font-bold">Login</h1>
          <p className="text-gray-500">Sign in to your account</p>
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
            <div className="text-center text-sm">
              <span className="text-gray-500">Don't have an account? </span>
              <Link href="/register" className="text-primary">
                Sign up
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
