import { create } from 'zustand';
import { apiPost } from '@/lib/api-client';
import { CalendarDate } from "@internationalized/date";

export interface AvailabilitySlot {
    id: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
}

interface AvailabilityStoreState {
    selectedDate: CalendarDate | null;
    startTime: string;
    endTime: string;
    availableSlots: AvailabilitySlot[];
    isSubmitting: boolean;
    submitMessage: string;
    errorMessage: string;

    setSelectedDate: (date: CalendarDate | null) => void;
    setStartTime: (time: string) => void;
    setEndTime: (time: string) => void;
    addSlot: () => void;
    removeSlot: (id: string) => void;
    submitAvailability: (employeeId: string) => Promise<void>;
    clearMessages: () => void;
    resetForm: () => void;
}

export const useEmployeeAvailabilityStore = create<AvailabilityStoreState>((set, get) => ({
    selectedDate: null,
    startTime: "09:00",
    endTime: "17:00",
    availableSlots: [],
    isSubmitting: false,
    submitMessage: "",
    errorMessage: "",

    setSelectedDate: (date) => set({ selectedDate: date }),
    setStartTime: (time) => set({ startTime: time }),
    setEndTime: (time) => set({ endTime: time }),

    addSlot: () => {
        const { selectedDate, startTime, endTime, availableSlots } = get();

        if (!selectedDate) {
            set({ errorMessage: "Please select a date" });
            return;
        }

        if (!startTime || !endTime) {
            set({ errorMessage: "Please enter both start and end time" });
            return;
        }

        if (startTime >= endTime) {
            set({ errorMessage: "End time must be after start time" });
            return;
        }

        const dateString = `${selectedDate.year}-${String(selectedDate.month).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}`;

        const newSlot: AvailabilitySlot = {
            id: `${dateString}-${startTime}-${endTime}-${Date.now()}`,
            date: dateString,
            startTime,
            endTime,
        };

        const exists = availableSlots.some(
            (slot) =>
                slot.date === dateString &&
                slot.startTime === startTime &&
                slot.endTime === endTime
        );

        if (exists) {
            set({ errorMessage: "This time slot already exists" });
            return;
        }

        const updatedSlots = [...availableSlots, newSlot].sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.startTime.localeCompare(b.startTime);
        });

        set({
            availableSlots: updatedSlots,
            selectedDate: null,
            startTime: "09:00",
            endTime: "17:00",
            errorMessage: ""
        });
    },

    removeSlot: (id) => {
        set((state) => ({
            availableSlots: state.availableSlots.filter((slot) => slot.id !== id)
        }));
    },

    submitAvailability: async (employeeId: string) => {
        const { availableSlots } = get();
        set({ isSubmitting: true, submitMessage: "", errorMessage: "" });

        if (availableSlots.length === 0) {
            set({ errorMessage: "Please add at least one availability slot", isSubmitting: false });
            return;
        }

        try {
            const combineDateTime = (date: string, time: string): string => {
                const [hours, minutes] = time.split(":");
                const [year, month, day] = date.split("-").map(Number);
                const dateTime = new Date(Date.UTC(year, month - 1, day, parseInt(hours), parseInt(minutes), 0));
                return dateTime.toISOString();
            };

            const promises = availableSlots.map((slot) => {
                const availabilityData = {
                    date: combineDateTime(slot.date, "00:00"),
                    startTime: combineDateTime(slot.date, slot.startTime),
                    endTime: combineDateTime(slot.date, slot.endTime),
                    status: "OPEN" as const,
                    employeeId: employeeId,
                };
                return apiPost("availability", availabilityData);
            });

            await Promise.all(promises);

            set({
                submitMessage: `Availability submitted successfully! ✓ ${availableSlots.length} slot(s) added.`,
                availableSlots: [],
                selectedDate: null,
                startTime: "09:00",
                endTime: "17:00",
            });
        } catch (error) {
            console.error("Error submitting availability:", error);
            set({
                errorMessage: error instanceof Error ? error.message : "Failed to submit availability. Please try again."
            });
            throw error;
        } finally {
            set({ isSubmitting: false });
        }
    },

    clearMessages: () => set({ submitMessage: "", errorMessage: "" }),

    resetForm: () => set({
        selectedDate: null,
        startTime: "09:00",
        endTime: "17:00",
        availableSlots: [],
        submitMessage: "",
        errorMessage: ""
    })
}));
