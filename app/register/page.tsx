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
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
      const success = await register(email, password);
      if (success) {
        router.push("/");
        router.refresh();
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
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
