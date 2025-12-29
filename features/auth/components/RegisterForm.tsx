"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, Input, Button, Link } from "@heroui/react";
import AuthHeader from "./AuthHeader";
import { useRegister } from "../hooks/useRegister";

export default function RegisterForm() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { handleSubmit, loading, error } = useRegister();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleSubmit({
            username,
            email,
            phone,
            password,
            confirmPassword,
        });
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <AuthHeader
                        title="Sign Up"
                        subtitle="Create a new account"
                    />
                </CardHeader>
                <CardBody className="pb-8">
                    <form onSubmit={onSubmit} className="space-y-4">
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
                            <Link href="/demo/login" className="text-primary">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}
