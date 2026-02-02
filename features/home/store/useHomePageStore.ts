import { create } from 'zustand';
import { apiGet } from '@/lib/api-client';
import { Appointment, AppointmentListResponse, User, UserListResponse } from '@/types/api';
import { format, parseISO } from "date-fns";

const TIME_SLOTS = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
];

interface HomePageStore {
    allAppointments: Appointment[];
    fullyBookedDates: string[];
    loading: boolean;
    employees: User[];
    availableTimeSlotsByDate: Map<string, string[]>;

    // Actions
    fetchEmployees: () => Promise<void>;
    fetchAllAppointments: () => Promise<void>;
    calculateAvailableTimeSlots: () => void;
}

export const useHomePageStore = create<HomePageStore>((set, get) => ({
    allAppointments: [],
    fullyBookedDates: [],
    loading: false,
    employees: [],
    availableTimeSlotsByDate: new Map(),

    fetchEmployees: async () => {
        try {
            const data: UserListResponse = await apiGet<UserListResponse>("user");
            const employeeList = (data.users || []).filter(
                (u: User) => u.role === "EMPLOYEE" || u.role === "employee"
            );
            set({ employees: employeeList });
        } catch (error) {
            console.error("Error fetching employees:", error);
            set({ employees: [] });
        }
    },

    fetchAllAppointments: async () => {
        set({ loading: true });
        try {
            const data: AppointmentListResponse = await apiGet<AppointmentListResponse>("appointment");
            const allAppts = (data.appointments || []).filter(
                (apt) => apt.status !== "CANCELLED"
            );
            set({ allAppointments: allAppts });
        } catch (error) {
            console.error("Error fetching appointments:", error);
            set({ allAppointments: [] });
        } finally {
            set({ loading: false });
        }
    },

    calculateAvailableTimeSlots: () => {
        const { employees, allAppointments } = get();

        if (employees.length === 0) {
            // Case: No employees, assume all slots open (fallback logic from original)
            const availableSlotsMap = new Map<string, string[]>();
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            for (let i = 0; i < 60; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const dateStr = format(date, "yyyy-MM-dd");
                availableSlotsMap.set(dateStr, [...TIME_SLOTS]);
            }
            set({ availableTimeSlotsByDate: availableSlotsMap, fullyBookedDates: [] });
            return;
        }

        const allEmployeeIds = new Set(employees.map(emp => emp.id));
        const fullyBooked: string[] = [];

        // Build map: date -> employeeId -> Set of time slots (where appointment exists)
        const dateEmployeeTimeMap = new Map<string, Map<string, Set<string>>>();

        allAppointments.forEach((apt) => {
            const aptDate = parseISO(apt.date);
            const dateStr = format(aptDate, "yyyy-MM-dd");
            const timeStr = format(aptDate, "HH:mm");

            if (!dateEmployeeTimeMap.has(dateStr)) {
                dateEmployeeTimeMap.set(dateStr, new Map());
            }
            const employeeMap = dateEmployeeTimeMap.get(dateStr)!;
            if (!employeeMap.has(apt.employeeId)) {
                employeeMap.set(apt.employeeId, new Set());
            }
            employeeMap.get(apt.employeeId)!.add(timeStr);
        });

        const availableSlotsMap = new Map<string, string[]>();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 60; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = format(date, "yyyy-MM-dd");

            const availableSlots: string[] = [];

            // Check availability for each slot
            TIME_SLOTS.forEach((slot) => {
                let allEmployeesBooked = true;
                const employeeMap = dateEmployeeTimeMap.get(dateStr);

                // Check if ALL employees are booked for this slot
                for (const employeeId of allEmployeeIds) {
                    const timeSet = employeeMap?.get(employeeId);
                    // If an employee doesn't have an appointment at this time, then the slot is effectively available (at least one person free)
                    if (!timeSet || !timeSet.has(slot)) {
                        allEmployeesBooked = false;
                        break;
                    }
                }

                if (!allEmployeesBooked) {
                    availableSlots.push(slot);
                }
            });

            availableSlotsMap.set(dateStr, availableSlots);

            if (availableSlots.length === 0 && allEmployeeIds.size > 0) {
                fullyBooked.push(dateStr);
            }
        }

        set({
            fullyBookedDates: fullyBooked,
            availableTimeSlotsByDate: availableSlotsMap
        });
    }
}));
