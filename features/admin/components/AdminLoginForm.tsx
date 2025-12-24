"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, Input, Button, Link } from "@heroui/react";
import NextLink from "next/link";
import AuthHeader from "@/features/auth/components/AuthHeader";
import { useAdminLogin } from "../hooks/useAdminLogin";

export default function AdminLoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { handleSubmit, loading, error } = useAdminLogin();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleSubmit(email, password);
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4 bg-gray-900">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <AuthHeader
                        title="Admin Portal"
                        subtitle="Sign in to access admin dashboard"
                    />
                </CardHeader>
                <CardBody className="pb-8">
                    <form onSubmit={onSubmit} className="space-y-4">
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
                                className="text-gray-400"
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

