import { create } from 'zustand';
import { Appointment, AppointmentListResponse } from '@/types/api';
import { apiGet } from '@/lib/api-client';

interface ProfileStore {
    appointments: Appointment[];
    loading: boolean;
    error: string;
    fetchAppointments: (userId: string) => Promise<void>;
}

export const useProfileStore = create<ProfileStore>((set) => ({
    appointments: [],
    loading: true,
    error: "",

    fetchAppointments: async (userId: string) => {
        set({ loading: true, error: "" });
        try {
            const data: AppointmentListResponse = await apiGet<AppointmentListResponse>("appointment");
            // 过滤出当前用户的预约
            const userAppointments = (data.appointments || []).filter(
                (apt) => apt.customerId === userId
            );
            set({ appointments: userAppointments, loading: false });
        } catch (error) {
            console.error("Error fetching appointments:", error);
            set({ loading: false, error: "Failed to load appointments. Please try again later." });
        }
    },
}));
