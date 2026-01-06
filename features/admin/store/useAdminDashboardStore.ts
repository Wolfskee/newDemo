import { create } from 'zustand';
import { apiGet } from '@/lib/api-client';
import { ItemListResponse, Appointment, UserListResponse, AppointmentListResponse } from '@/types/api';

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
        set({ loading: true, error: "" });
        try {
            // 输入验证
            if (!employeeId || typeof employeeId !== 'string' || employeeId.trim() === '') {
                throw new Error("Invalid employee ID provided");
            }

            // 使用 GET /appointment/user/{userId} 端点获取指定员工的所有预约
            const sanitizedEmployeeId = encodeURIComponent(employeeId.trim());
            const endpoint = `appointment/user/${sanitizedEmployeeId}`;
            
            console.log("Fetching appointments for employee:", employeeId, "using endpoint:", endpoint);
            
            let appointments: Appointment[] = [];
            
            try {
                // 直接调用 API，不带 date 参数以获取所有预约
                // API 返回格式：Appointment[] (数组)
                appointments = await apiGet<Appointment[]>(endpoint);
                console.log("Appointments fetched successfully:", appointments.length, "appointments");
            } catch (apiError) {
                // 如果直接调用失败，尝试使用备用方案
                console.warn("Failed to fetch appointments by user endpoint, using fallback:", apiError);
                try {
                    const data = await apiGet<AppointmentListResponse>("appointment");
                    appointments = data.appointments || [];
                    // 过滤出该员工的预约
                    appointments = appointments.filter(
                        (apt) => apt && apt.employeeId === employeeId
                    );
                } catch (finalError) {
                    console.error("All appointment fetch methods failed:", finalError);
                    throw finalError;
                }
            }
            
            // 验证返回的数据结构
            if (!Array.isArray(appointments)) {
                console.warn("Invalid response format, expected array but got:", typeof appointments, appointments);
                appointments = [];
            }
            
            // 过滤出该员工的预约，排除已取消的预约
            // 注意：API 应该已经返回该员工的预约，但这里做额外的验证
            const employeeAppointments = appointments.filter(
                (apt) => apt && apt.employeeId === employeeId && apt.status !== "CANCELLED"
            );
            
            // 按日期排序（最新的在前）
            const sortedAppointments = employeeAppointments.sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return dateB - dateA; // 降序排列
            });
            
            console.log("Filtered and sorted appointments:", sortedAppointments.length, "appointments");
            
            set({ 
                appointments: sortedAppointments,
                loading: false,
                error: ""
            });
        } catch (error) {
            console.error("Error fetching appointments:", error);
            const errorMessage = error instanceof Error 
                ? error.message 
                : "Failed to load appointments.";
            set({ 
                appointments: [],
                loading: false,
                error: errorMessage
            });
        }
    },
}));


