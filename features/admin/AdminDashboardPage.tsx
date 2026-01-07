"use client";

import { useState } from "react";
import { useAdminDashboard } from "./hooks/useAdminDashboard";
import AdminDashboardHeader from "./components/AdminDashboardHeader";
import StatsCard from "./components/StatsCard";
import RecentOrdersCard from "./components/RecentOrdersCard";
import QuickActionsCard from "./components/QuickActionsCard";
import MyAppointmentsSection from "./components/MyAppointmentsSection";
import AdminDashboardLoadingSkeleton from "./components/AdminDashboardLoadingSkeleton";
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
        return <AdminDashboardLoadingSkeleton />;
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
                    flex-1 transition-all duration-300 ease-in-out
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
                            <RecentOrdersCard orders={recentOrders} />
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
