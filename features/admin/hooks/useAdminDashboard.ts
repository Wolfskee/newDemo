import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearTokens } from "@/lib/api-client";
import { useAdminDashboardStore } from "../store/useAdminDashboardStore";
import { useRecentOrdersStore } from "../store/useRecentOrdersStore";

interface AdminUser {
    id: string;
    email: string;
    role: string;
}

export const useAdminDashboard = () => {
    const router = useRouter();
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const { stats, appointments, loading, fetchStats, fetchAppointments } = useAdminDashboardStore();
    const { recentOrders } = useRecentOrdersStore();

    useEffect(() => {
        const stored = localStorage.getItem("adminUser");
        if (stored) {
            try {
                const user = JSON.parse(stored);
                setAdminUser(user);
                fetchStats();

                // 检查是否为员工角色（支持多种格式）
                const userRole = user.role?.toUpperCase();
                if (userRole === "EMPLOYEE") {
                    if (user.id) {
                        console.log("Fetching appointments for employee:", user.id);
                        fetchAppointments(user.id);
                    } else {
                        console.error("Employee ID is missing:", user);
                    }
                }
            } catch (error) {
                console.error("Error parsing adminUser from localStorage:", error);
                router.push("/admin");
            }
        } else {
            router.push("/admin");
        }
    }, [router, fetchStats, fetchAppointments]);

    const handleAppointmentsUpdate = () => {
        // 刷新预约列表
        if (adminUser && (adminUser.role === "EMPLOYEE" || adminUser.role === "employee")) {
            fetchAppointments(adminUser.id);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("adminUser");
        clearTokens();
        router.push("/admin");
    };

    const isEmployee = adminUser?.role === "EMPLOYEE" || adminUser?.role === "employee";



    return {
        adminUser,
        stats,
        appointments,
        loading,
        isEmployee,
        recentOrders,
        handleLogout,
        handleAppointmentsUpdate,
    };
};


