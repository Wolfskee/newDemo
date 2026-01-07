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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                    {isEmployee ? "Employee Dashboard" : "Admin Dashboard"}
                </h1>
                <p className="text-sm sm:text-base text-gray-400 mt-1 sm:mt-2">
                    Welcome, {adminUser.email} ({adminUser.role})
                </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <Button
                    color="default"
                    variant="flat"
                    onPress={() => router.push("/")}
                    size="sm"
                    className="flex-1 sm:flex-none"
                >
                    Home
                </Button>
                <Button 
                    color="danger" 
                    variant="flat" 
                    onPress={onLogout}
                    size="sm"
                    className="flex-1 sm:flex-none"
                >
                    Logout
                </Button>
            </div>
        </div>
    );
}
