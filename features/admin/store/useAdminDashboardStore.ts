import { create } from 'zustand';
import { apiGet } from '@/lib/api-client';
import { ItemListResponse, Appointment, UserListResponse } from '@/types/api';

interface Stat {
    label: string;
    value: string;
    color: string;
}

interface AdminDashboardStore {
    stats: Stat[];
    appointments: Appointment[];
    loading: boolean;
    error: string;
    fetchStats: () => Promise<void>;
    fetchAppointments: (employeeId: string) => Promise<void>;
}

export const useAdminDashboardStore = create<AdminDashboardStore>((set) => ({
    stats: [
        { label: "Total Products", value: "0", color: "primary" },
        { label: "Total Services", value: "0", color: "secondary" },
        { label: "Active Users", value: "0", color: "success" },
        { label: "Orders Today", value: "0", color: "warning" },
    ],
    appointments: [],
    loading: true,
    error: "",

    fetchStats: async () => {
        set({ loading: true, error: "" });
        try {
            const [itemsData, usersData] = await Promise.all([
                apiGet<ItemListResponse>("item"),
                apiGet<UserListResponse>("user"),
            ]);

            const totalItems = itemsData.total || 0;

            const productsCount = (itemsData.items || []).filter(
                (item) => !item.duration || item.duration === 0
            ).length;

            const servicesCount = totalItems - productsCount;

            const customersCount = (usersData.users || []).filter(
                (user) => user.role === "CUSTOMER" || user.role === "customer"
            ).length;

            set({
                stats: [
                    { label: "Total Products", value: productsCount.toString(), color: "primary" },
                    { label: "Total Services", value: servicesCount.toString(), color: "secondary" },
                    { label: "Active Users", value: customersCount.toString(), color: "success" },
                    { label: "Orders Today", value: "0", color: "warning" },
                ],
                loading: false,
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
            set({ loading: false, error: "Failed to load dashboard statistics." });
        }
    },

    fetchAppointments: async (employeeId: string) => {
        try {
            // 使用 /appointment/user/{employeeId} 端点获取指定员工的预约
            const sanitizedEmployeeId = encodeURIComponent(employeeId.trim());
            const endpoint = `appointment/user/${sanitizedEmployeeId}`;
            
            // 获取当前日期，格式化为 YYYY-MM-DD，用于筛选未来和今天的预约
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const currentDate = `${year}-${month}-${day}`;
            
            const appointments: Appointment[] = await apiGet<Appointment[]>(endpoint, {
                params: {
                    date: currentDate
                }
            });
            
            // 过滤出该员工的预约（虽然 API 应该已经返回正确的数据，但这是额外的安全检查）
            const employeeAppointments = (appointments || []).filter(
                (apt) => apt.employeeId === employeeId && apt.status !== "CANCELLED"
            );
            
            set({ appointments: employeeAppointments });
        } catch (error) {
            console.error("Error fetching appointments:", error);
            set({ error: "Failed to load appointments." });
        }
    },
}));


