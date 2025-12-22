"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";

interface AdminUser {
    id: string;
    email: string;
    role: string;
}

interface AdminDashboardHeaderProps {
    adminUser: AdminUser;
    onLogout: () => void;
}

export default function AdminDashboardHeader({ adminUser, onLogout }: AdminDashboardHeaderProps) {
    const router = useRouter();
    const isEmployee = adminUser.role === "EMPLOYEE" || adminUser.role === "employee";

    return (
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                    {isEmployee ? "Employee Dashboard" : "Admin Dashboard"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Welcome, {adminUser.email} ({adminUser.role})
                </p>
            </div>
            <div className="flex gap-2">
                <Button
                    color="default"
                    variant="flat"
                    onPress={() => router.push("/")}
                >
                    Home
                </Button>
                <Button color="danger" variant="flat" onPress={onLogout}>
                    Logout
                </Button>
            </div>
        </div>
    );
}
