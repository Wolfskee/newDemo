"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import DayStaffSchedule from "./components/DayStaffSchedule";
import QuickActionsCard from "./components/QuickActionsCard";
import ManageEmployeeAvailability from "./components/ManageEmployeeAvailability";

export default function SchedulingPage() {
    const router = useRouter();
    const [adminUser, setAdminUser] = useState<{ id?: string; email: string; role: string } | null>(null);
    const [isNavExpanded, setIsNavExpanded] = useState(true);
    const isEmployee = adminUser?.role === "EMPLOYEE" || adminUser?.role === "employee";
    const isAdmin = adminUser?.role?.toUpperCase() === "ADMIN";
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        // Check admin permission
        const stored = localStorage.getItem("adminUser");
        if (!stored) {
            router.push("/admin");
        } else {
            const user = JSON.parse(stored);
            setAdminUser(user);
        }
    }, [router]);

    if (!adminUser) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            {/* 左侧导航栏 */}
            <QuickActionsCard
                adminUser={adminUser}
                isExpanded={isNavExpanded}
                onToggle={() => setIsNavExpanded(!isNavExpanded)}
            />

            {/* 主内容区 */}
            <main
                className={`
                    flex-1 transition-all duration-300 ease-in-out
                `}
            >
                <div className="py-4 md:py-8 px-3 sm:px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8 gap-4">
                            <div>
                                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
                                    Employee Scheduling
                                </h1>
                                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 md:mt-2">
                                    {isAdmin ? "View and manage all employee schedules and availability" : "View and manage employee schedules"}
                                </p>
                            </div>
                            <Button
                                color="default"
                                variant="flat"
                                onPress={() => router.push("/admin/dashboard")}
                                size="sm"
                                className="w-full sm:w-auto"
                            >
                                ← Back to Dashboard
                            </Button>
                        </div>

                        {isAdmin ? (
                            // ADMIN 用户：显示所有员工的 availability 管理
                            <div className="space-y-6">
                                <ManageEmployeeAvailability onSuccess={() => setRefreshKey(prev => prev + 1)} />
                                <DayStaffSchedule
                                    readOnly={false}
                                    refreshTrigger={refreshKey}
                                />
                            </div>
                        ) : (
                            // Employee 用户：只显示自己的排班和可用性表单
                            <DayStaffSchedule
                                readOnly={isEmployee}
                                employeeId={isEmployee ? adminUser.id : undefined}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}