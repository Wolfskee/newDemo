import { useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import { useHomePageStore } from '../store/useHomePageStore';
import { useAuth } from "@/contexts/AuthContext";

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

export const useHomePageLogic = () => {
    const store = useHomePageStore();
    const router = useRouter();
    const { user } = useAuth();

    // Initial data fetch
    useEffect(() => {
        const loadData = async () => {
            // We can fetch concurrently
            await Promise.all([
                store.fetchEmployees(),
                store.fetchAllAppointments()
            ]);
        };
        loadData();
    }, []);

    // Recalculate available slots when data changes
    useEffect(() => {
        store.calculateAvailableTimeSlots();
    }, [store.employees, store.allAppointments]);

    // Handle initial hash navigation
    useEffect(() => {
        if (typeof window !== "undefined" && window.location.hash === "#booking-calendar") {
            const element = document.getElementById("booking-calendar");
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
        }
    }, []);

    const handleDateClick = (date: string) => {
        if (!user) {
            router.push("/login");
        } else {
            router.push("/profile#booking");
        }
    };

    return {
        ...store,
        timeSlots: TIME_SLOTS,
        handleDateClick
    };
};
