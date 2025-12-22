"use client";

import { useAdminDashboard } from "./hooks/useAdminDashboard";
import AdminDashboardHeader from "./components/AdminDashboardHeader";
import StatsCard from "./components/StatsCard";
import RecentOrdersCard from "./components/RecentOrdersCard";
import QuickActionsCard from "./components/QuickActionsCard";
import MyAppointmentsSection from "./components/MyAppointmentsSection";
import AdminDashboardLoadingSkeleton from "./components/AdminDashboardLoadingSkeleton";

export default function AdminDashboardPage() {
    const {
        adminUser,
        stats,
        appointments,
        loading,
        isEmployee,
        recentOrders,
        handleLogout,
    } = useAdminDashboard();

    if (!adminUser || loading) {
        return <AdminDashboardLoadingSkeleton />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <RecentOrdersCard orders={recentOrders} />
                    <QuickActionsCard adminUser={adminUser} />
                </div>

                {isEmployee && (
                    <MyAppointmentsSection appointments={appointments} />
                )}
            </div>
        </div>
    );
}
