"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, Input, Button, Link } from "@heroui/react";
import AuthHeader from "./AuthHeader";
import { useLogin } from "../hooks/useLogin";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { handleSubmit, loading, error } = useLogin();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleSubmit(email, password);
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <AuthHeader
                        title="Login"
                        subtitle="Sign in to your account"
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
