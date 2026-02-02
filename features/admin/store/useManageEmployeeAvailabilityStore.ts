import { create } from 'zustand';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { User, UserListResponse, Availability } from '@/types/api';
import { CalendarDate, parseDate } from "@internationalized/date";

export interface ManageEmployeeAvailabilityStoreState {
    employees: User[];
    selectedEmployee: User | null;
    editingAvailability: Availability | null;
    availabilities: Availability[];
    loadingAvailabilities: boolean;
    queryDate: CalendarDate | null;

    // Modal form state
    selectedDate: CalendarDate | null;
    startTime: string;
    endTime: string;
    status: string;
    isSubmitting: boolean;

    // Actions
    setQueryDate: (date: CalendarDate | null) => void;
    setSelectedEmployee: (employee: User | null) => void;
    fetchEmployees: () => Promise<void>;
    fetchEmployeeAvailability: () => Promise<void>;

    // Helper to open modal
    prepareModal: (availability?: Availability) => void;

    // CRUD
    handleSubmit: () => Promise<void>;
    handleDelete: (id: string) => Promise<void>;

    // Form Setters
    setSelectedDate: (date: CalendarDate | null) => void;
    setStartTime: (time: string) => void;
    setEndTime: (time: string) => void;
    setStatus: (status: string) => void;
}

const combineDateTime = (date: string, time: string): string => {
    const [hours, minutes] = time.split(":");
    const [year, month, day] = date.split("-").map(Number);
    const dateTime = new Date(Date.UTC(year, month - 1, day, parseInt(hours), parseInt(minutes), 0));
    return dateTime.toISOString();
};

export const useManageEmployeeAvailabilityStore = create<ManageEmployeeAvailabilityStoreState>((set, get) => ({
    employees: [],
    selectedEmployee: null,
    editingAvailability: null,
    availabilities: [],
    loadingAvailabilities: false,
    queryDate: parseDate(new Date().toISOString().split("T")[0]),

    selectedDate: null,
    startTime: "09:00",
    endTime: "17:00",
    status: "OPEN",
    isSubmitting: false,

    setQueryDate: (date) => set({ queryDate: date }),
    setSelectedEmployee: (employee) => set({ selectedEmployee: employee }),
    setSelectedDate: (date) => set({ selectedDate: date }),
    setStartTime: (time) => set({ startTime: time }),
    setEndTime: (time) => set({ endTime: time }),
    setStatus: (status) => set({ status: status }),

    fetchEmployees: async () => {
        try {
            const data: UserListResponse = await apiGet<UserListResponse>("user");
            const employeeList = (data.users || []).filter(
                (user: User) => user.role === "EMPLOYEE" || user.role === "employee"
            );
            set({ employees: employeeList });
        } catch (error) {
            console.error("Error fetching employees:", error);
            set({ employees: [] });
        }
    },

    fetchEmployeeAvailability: async () => {
        const { queryDate, selectedEmployee } = get();
        if (!queryDate) return;

        set({ loadingAvailabilities: true });
        try {
            const dateString = `${queryDate.year}-${String(queryDate.month).padStart(2, "0")}-${String(queryDate.day).padStart(2, "0")}`;
            const params: Record<string, string> = { date: dateString };
            if (selectedEmployee) {
                params.employeeId = selectedEmployee.id;
            }

            const response = await apiGet<any>(`availability`, { params });
            let availabilities: Availability[] = [];

            if (Array.isArray(response)) {
                availabilities = response;
            } else if (response?.availabilities && Array.isArray(response.availabilities)) {
                availabilities = response.availabilities;
            } else if (response?.data && Array.isArray(response.data)) {
                availabilities = response.data;
            }

            set({ availabilities, loadingAvailabilities: false });
        } catch (error) {
            console.error("Error fetching availability:", error);
            set({ availabilities: [], loadingAvailabilities: false });
        }
    },

    prepareModal: (availability?: Availability) => {
        if (availability) {
            const dateStr = availability.date.split("T")[0];
            // Helper to format time back to HH:mm
            const formatTime = (isoString: string) => {
                const date = new Date(isoString);
                const hours = String(date.getUTCHours()).padStart(2, "0");
                const minutes = String(date.getUTCMinutes()).padStart(2, "0");
                return `${hours}:${minutes}`;
            };

            set({
                editingAvailability: availability,
                selectedDate: parseDate(dateStr),
                startTime: formatTime(availability.startTime),
                endTime: formatTime(availability.endTime),
                status: availability.status
            });
        } else {
            set({
                editingAvailability: null,
                selectedDate: null,
                startTime: "09:00",
                endTime: "17:00",
                status: "OPEN"
            });
        }
    },

    handleSubmit: async () => {
        const {
            editingAvailability,
            selectedEmployee,
            selectedDate,
            startTime,
            endTime,
            status
        } = get();

        const targetEmployeeId = editingAvailability?.employeeId || selectedEmployee?.id;

        if (!targetEmployeeId || !selectedDate) throw new Error("Please select an employee and date");
        if (!startTime || !endTime) throw new Error("Please enter both start and end time");
        if (startTime >= endTime) throw new Error("End time must be after start time");

        set({ isSubmitting: true });
        try {
            const dateString = `${selectedDate.year}-${String(selectedDate.month).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}`;
            const availabilityData = {
                date: combineDateTime(dateString, "00:00"),
                startTime: combineDateTime(dateString, startTime),
                endTime: combineDateTime(dateString, endTime),
                status: status,
                employeeId: targetEmployeeId,
            };

            if (editingAvailability) {
                await apiPut(`availability/${editingAvailability.id}`, availabilityData);
            } else {
                await apiPost("availability", availabilityData);
            }

            await get().fetchEmployeeAvailability();
        } catch (error) {
            console.error("Error saving availability:", error);
            throw error;
        } finally {
            set({ isSubmitting: false });
        }
    },

    handleDelete: async (id) => {
        try {
            await apiDelete(`availability/${id}`);
            await get().fetchEmployeeAvailability();
        } catch (error) {
            console.error("Error deleting availability:", error);
            throw error;
        }
    }
}));
