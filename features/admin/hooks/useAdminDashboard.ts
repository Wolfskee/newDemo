import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearTokens } from "@/lib/api-client";
import { useAdminDashboardStore } from "../store/useAdminDashboardStore";

interface AdminUser {
    id: string;
    email: string;
    role: string;
}

export const useAdminDashboard = () => {
    const router = useRouter();
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const { stats, appointments, loading, fetchStats, fetchAppointments } = useAdminDashboardStore();

    useEffect(() => {
        const stored = localStorage.getItem("adminUser");
        if (stored) {
            const user = JSON.parse(stored);
            setAdminUser(user);
            fetchStats();

            if (user.role === "EMPLOYEE" || user.role === "employee") {
                fetchAppointments(user.id);
            }
        } else {
            router.push("/admin");
        }
    }, [router, fetchStats, fetchAppointments]);

    const handleLogout = () => {
        localStorage.removeItem("adminUser");
        clearTokens();
        router.push("/admin");
    };

    const isEmployee = adminUser?.role === "EMPLOYEE" || adminUser?.role === "employee";

    const recentOrders = [
        { id: 1, customer: "John Doe", product: "Premium Product 1", status: "Completed", date: "2024-01-15" },
        { id: 2, customer: "Jane Smith", product: "Premium Product 2", status: "Pending", date: "2024-01-15" },
        { id: 3, customer: "Bob Johnson", product: "Consulting Service", status: "In Progress", date: "2024-01-14" },
    ];

    return {
        adminUser,
        stats,
        appointments,
        loading,
        isEmployee,
        recentOrders,
        handleLogout,
    };
};


