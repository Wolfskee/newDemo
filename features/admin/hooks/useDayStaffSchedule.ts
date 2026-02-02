import { useEffect, useMemo, useState } from 'react';
import { useDayStaffScheduleStore } from '../store/useDayStaffScheduleStore';
import { apiGet } from '@/lib/api-client';
import { Availability, User } from '@/types/api';
import { Employee } from '../store/useDayStaffScheduleStore';

function addDays(d: Date, n: number) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
}

function startOfWeek(d: Date) {
    const x = new Date(d);
    const day = x.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // Monday start
    x.setDate(x.getDate() + diff);
    x.setHours(0, 0, 0, 0);
    return x;
}

export const useDayStaffSchedule = () => {
    const store = useDayStaffScheduleStore();
    const [openAddStaffModal, setOpenAddStaffModal] = useState(false);
    const [activeDate, setActiveDate] = useState<string | null>(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
    const [loadingAvailableEmployees, setLoadingAvailableEmployees] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial load
    useEffect(() => {
        store.setWeekStart(startOfWeek(new Date()));
        store.fetchEmployees();
    }, []);

    const days = useMemo(
        () => Array.from({ length: 7 }, (_, i) => addDays(store.weekStart, i)),
        [store.weekStart],
    );

    const employeesById = useMemo(() => {
        return new Map(store.employees.map((e) => [e.id, e]));
    }, [store.employees]);

    // Fetch assignments when dependencies change
    useEffect(() => {
        if (!store.loading) {
            store.fetchAssignedAvailabilities(days);
        }
    }, [store.weekStart, store.loading]);

    // Fetch available employees for modal
    useEffect(() => {
        if (!openAddStaffModal || !activeDate) return;

        const fetchAvailableEmployees = async () => {
            setLoadingAvailableEmployees(true);
            try {
                const response = await apiGet<any>("availability", {
                    params: { date: activeDate },
                });

                let availabilities: Availability[] = [];
                if (Array.isArray(response)) {
                    availabilities = response;
                } else if (response?.availabilities && Array.isArray(response.availabilities)) {
                    availabilities = response.availabilities;
                } else if (response?.data && Array.isArray(response.data)) {
                    availabilities = response.data;
                }

                const openEmployeeIds = new Set(
                    availabilities
                        .filter((a: Availability) => a.status === "OPEN")
                        .map((a: Availability) => a.employeeId)
                );

                const filtered = store.employees.filter((e) => openEmployeeIds.has(e.id));
                setAvailableEmployees(filtered);
            } catch (error) {
                console.error("Error fetching available employees:", error);
                setAvailableEmployees([]);
            } finally {
                setLoadingAvailableEmployees(false);
            }
        };

        fetchAvailableEmployees();
    }, [openAddStaffModal, activeDate, store.employees]);

    const handleRemoveAssignment = async (date: string, employeeId: string) => {
        if (!confirm("Are you sure you want to remove this staff from the schedule?")) return;
        try {
            await store.removeAssignment(date, employeeId);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to remove staff");
        }
    };

    const handleAddStaffToDay = async () => {
        if (!activeDate || !selectedEmployeeId) return;
        setIsSubmitting(true);
        try {
            await store.addStaffToDay(activeDate, selectedEmployeeId, days);
            setOpenAddStaffModal(false);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to assign staff");
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        ...store,
        days,
        employeesById,
        openAddStaffModal,
        setOpenAddStaffModal,
        activeDate,
        setActiveDate,
        selectedEmployeeId,
        setSelectedEmployeeId,
        availableEmployees,
        loadingAvailableEmployees,
        isSubmitting,
        handleRemoveAssignment,
        handleAddStaffToDay
    };
};
