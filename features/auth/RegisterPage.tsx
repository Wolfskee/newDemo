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
import { AuthResponse } from "@/types/api";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 验证必填字段
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const authData: AuthResponse = await apiPost<AuthResponse>(
        "auth/register",
        {
          username: username.trim(),
          email: email.trim(),
          password: password,
          role: "CUSTOMER",
          phone: phone.trim(),
        },
        { skipAuth: true }
      );

      // 注册成功，保存 tokens（如果需要自动登录）
      if (authData.accessToken && authData.refreshToken) {
        // 可以选择自动登录或跳转到登录页
        // 这里选择跳转到登录页，让用户手动登录
        router.push("/login");
        router.refresh();
      } else {
        // 如果没有返回 tokens，也跳转到登录页
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Registration error:", err);
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
          <h1 className="text-3xl font-bold">Sign Up</h1>
          <p className="text-gray-500">Create a new account</p>
        </CardHeader>
        <CardBody className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              fullWidth
            />
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
              label="Phone Number"
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              Sign Up
            </Button>
            <div className="text-center text-sm">
              <span className="text-gray-500">Already have an account? </span>
              <Link href="/login" className="text-primary">
                Sign in
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
