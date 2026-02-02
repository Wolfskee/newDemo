import { create } from 'zustand';
import { apiGet, apiPut } from '@/lib/api-client';
import { User, UserListResponse, Availability } from '@/types/api';

export type Employee = { id: string; name: string; email?: string; phone?: string; role?: string };
export type Assignment = {
    employeeId: string;
    date: string; // date: YYYY-MM-DD
    availabilityId?: string;
    startTime?: string;
    endTime?: string;
};

interface DayStaffScheduleStore {
    weekStart: Date;
    assignments: Assignment[];
    employees: Employee[];
    usersById: Map<string, User>;
    loading: boolean;
    error: string | null;
    loadingAssignments: boolean;

    // Actions
    setWeekStart: (date: Date) => void;
    fetchEmployees: () => Promise<void>;
    fetchAssignedAvailabilities: (days: Date[]) => Promise<void>;
    removeAssignment: (date: string, employeeId: string) => Promise<void>;
    addStaffToDay: (date: string, employeeId: string, days: Date[]) => Promise<void>;
    refresh: () => Promise<void>;
}

function startOfWeek(d: Date) {
    const x = new Date(d);
    const day = x.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // Monday start
    x.setDate(x.getDate() + diff);
    x.setHours(0, 0, 0, 0);
    return x;
}

function toISODate(d: Date) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export const useDayStaffScheduleStore = create<DayStaffScheduleStore>((set, get) => ({
    weekStart: startOfWeek(new Date()),
    assignments: [],
    employees: [],
    usersById: new Map(),
    loading: true,
    error: null,
    loadingAssignments: false,

    setWeekStart: (date: Date) => set({ weekStart: date }),

    fetchEmployees: async () => {
        set({ loading: true, error: null });
        try {
            const data: UserListResponse = await apiGet<UserListResponse>("user");
            const employeeList = (data.users || []).filter(
                (user: User) => user.role === "EMPLOYEE" || user.role === "employee"
            );
            const formattedEmployees: Employee[] = employeeList.map((user: User) => ({
                id: user.id,
                name: user.username || user.email,
                email: user.email,
                phone: user.phone,
                role: user.role === "EMPLOYEE" || user.role === "employee" ? "Employee" : undefined,
            }));

            const userMap = new Map<string, User>();
            (data.users || []).forEach((user: User) => {
                userMap.set(user.id, user);
            });

            set({
                employees: formattedEmployees,
                usersById: userMap,
                loading: false
            });
        } catch (err) {
            console.error("Error fetching employees:", err);
            set({
                error: err instanceof Error ? err.message : "Failed to fetch employees",
                loading: false
            });
        }
    },

    fetchAssignedAvailabilities: async (days: Date[]) => {
        set({ loadingAssignments: true });
        const assignedList: Assignment[] = [];

        try {
            for (const day of days) {
                const dateStr = toISODate(day);
                try {
                    const response = await apiGet<any>("availability", {
                        params: { date: dateStr },
                    });

                    let availabilities: Availability[] = [];
                    if (Array.isArray(response)) {
                        availabilities = response;
                    } else if (response?.availabilities && Array.isArray(response.availabilities)) {
                        availabilities = response.availabilities;
                    } else if (response?.data && Array.isArray(response.data)) {
                        availabilities = response.data;
                    }

                    const assigned = availabilities.filter((a: Availability) => a.status === "ASSIGNED");
                    assigned.forEach((a: Availability) => {
                        assignedList.push({
                            date: dateStr,
                            employeeId: a.employeeId,
                            availabilityId: a.id,
                            startTime: a.startTime,
                            endTime: a.endTime,
                        });
                    });
                } catch (err) {
                    console.error(`Error fetching availability for ${dateStr}:`, err);
                }
            }
            set({ assignments: assignedList, loadingAssignments: false });
        } catch (err) {
            console.error("Error fetching assigned availabilities:", err);
            set({ loadingAssignments: false });
        }
    },

    removeAssignment: async (date: string, employeeId: string) => {
        const { assignments, fetchAssignedAvailabilities } = get();
        const assignment = assignments.find((a) => a.date === date && a.employeeId === employeeId);
        if (!assignment?.availabilityId) return;

        try {
            await apiPut(`availability/${assignment.availabilityId}`, { status: "OPEN" });
            // Since we need to refresh, usually the component would call fetchAssignedAvailabilities again.
            // But here, we can potentially remove it from local state to be optimistic, OR re-fetch.
            // The hook will handle re-fetching if we want, or we can just update local state.
            // Let's optimistic update for now.
            set((state) => ({
                assignments: state.assignments.filter(a => !(a.date === date && a.employeeId === employeeId))
            }));
        } catch (error) {
            console.error("Error removing assignment:", error);
            throw error; // Re-throw to let UI handle alert
        }
    },

    addStaffToDay: async (date: string, employeeId: string, days: Date[]) => {
        try {
            const response = await apiGet<any>("availability", {
                params: {
                    date: date,
                    employeeId: employeeId,
                },
            });

            let availabilities: Availability[] = [];
            if (Array.isArray(response)) {
                availabilities = response;
            } else if (response?.availabilities && Array.isArray(response.availabilities)) {
                availabilities = response.availabilities;
            } else if (response?.data && Array.isArray(response.data)) {
                availabilities = response.data;
            }

            const validAvailabilities = availabilities.filter(
                (a: Availability) => a.employeeId === employeeId && a.status === "OPEN"
            );

            if (validAvailabilities.length === 0) {
                throw new Error("No available time slot found for this employee on this date. Please ensure the employee has created an availability with OPEN status.");
            }

            const openAvailability = validAvailabilities[0];
            await apiPut(`availability/assign/${openAvailability.id}`);

            // Trigger refresh
            await get().fetchAssignedAvailabilities(days);
        } catch (error) {
            console.error("Error assigning staff:", error);
            throw error;
        }
    },

    refresh: async () => {
        const { weekStart, fetchAssignedAvailabilities } = get();
        const days = Array.from({ length: 7 }, (_, i) => {
            const x = new Date(weekStart);
            x.setDate(x.getDate() + i);
            x.setHours(0, 0, 0, 0);
            return x;
        });
        await fetchAssignedAvailabilities(days);
    }
}));
