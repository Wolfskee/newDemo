"use client";

import { useState } from "react";
import { useAdminDashboard } from "./hooks/useAdminDashboard";
import AdminDashboardHeader from "./components/AdminDashboardHeader";
import StatsCard from "./components/StatsCard";
import RecentOrdersCard from "./components/RecentOrdersCard";
import QuickActionsCard from "./components/QuickActionsCard";
import MyAppointmentsSection from "./components/MyAppointmentsSection";
import { Skeleton, Card } from "@heroui/react";
import DayStaffSchedule from "./components/DayStaffSchedule";

export default function AdminDashboardPage() {
    const {
        adminUser,
        stats,
        appointments,
        loading,
        isEmployee,
        recentOrders,
        handleLogout,
        handleAppointmentsUpdate,
    } = useAdminDashboard();

    const [isNavExpanded, setIsNavExpanded] = useState(true);

    if (!adminUser || loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex">
                {/* Skeleton Sidebar */}
                <div className={`
                    hidden lg:flex flex-col fixed left-0 top-0 h-full bg-gray-900 border-r border-gray-800 z-50
                    transition-all duration-300 ease-in-out w-64 p-4 gap-4
                `}>
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                </div>

                {/* Skeleton Main Content */}
                <main className="flex-1 lg:ml-64 py-4 md:py-8 px-3 sm:px-4">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Header Skeleton */}
                        <div className="flex justify-between items-center mb-8">
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-48 rounded-lg" />
                                <Skeleton className="h-4 w-64 rounded-lg" />
                            </div>
                            <Skeleton className="h-10 w-24 rounded-lg" />
                        </div>

                        {/* Stats Grid Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <Card key={i} className="p-4 space-y-3">
                                    <Skeleton className="h-4 w-24 rounded-lg" />
                                    <Skeleton className="h-8 w-16 rounded-lg" />
                                </Card>
                            ))}
                        </div>

                        {/* Recent Orders Skeleton */}
                        <Card className="p-4 space-y-4">
                            <Skeleton className="h-8 w-48 rounded-lg" />
                            <Skeleton className="h-64 w-full rounded-lg" />
                        </Card>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex">
            {/* 左侧导航栏 */}
            <QuickActionsCard
                adminUser={adminUser}
                isExpanded={isNavExpanded}
                onToggle={() => setIsNavExpanded(!isNavExpanded)}
            />

            {/* 主内容区 */}
            <main
                className={`
                    flex-1 min-w-0 transition-all duration-300 ease-in-out
                    lg:${isNavExpanded ? 'ml-64' : 'ml-20'}
                `}
            >
                <div className="py-4 md:py-8 px-3 sm:px-4">
                    <div className="max-w-7xl mx-auto">
                        <AdminDashboardHeader adminUser={adminUser} onLogout={handleLogout} />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {stats.map((stat, index) => (
                                <StatsCard
                                    key={index}
                                    label={stat.label}
                                    value={stat.value}
                                    color={stat.color}
                                />
                            ))}
                        </div>

                        <div className="mb-8">
                            <RecentOrdersCard />
                        </div>

                        {isEmployee && (
                            <>

                                <MyAppointmentsSection
                                    appointments={appointments}
                                    onAppointmentsUpdate={handleAppointmentsUpdate}
                                />
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
