import { create } from 'zustand';
import { apiGet } from '@/lib/api-client';
import { ItemListResponse, AppointmentListResponse, Appointment, UserListResponse } from '@/types/api';

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
            const data: AppointmentListResponse = await apiGet<AppointmentListResponse>("appointment");
            const employeeAppointments = (data.appointments || []).filter(
                (apt) => apt.employeeId === employeeId
            );
            set({ appointments: employeeAppointments });
        } catch (error) {
            console.error("Error fetching appointments:", error);
            set({ error: "Failed to load appointments." });
        }
    },
}));


