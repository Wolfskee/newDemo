import { useEffect, useState } from 'react';
import { useDisclosure } from '@heroui/react';
import { useManageEmployeeAvailabilityStore } from '../store/useManageEmployeeAvailabilityStore';
import { Availability } from '@/types/api';

import { useDayStaffScheduleStore } from '../store/useDayStaffScheduleStore';

export const useManageEmployeeAvailability = () => {
    const store = useManageEmployeeAvailabilityStore();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            await store.fetchEmployees();
            setLoading(false);
        };
        init();
    }, []);

    useEffect(() => {
        if (store.queryDate) {
            store.fetchEmployeeAvailability();
        }
    }, [store.queryDate, store.selectedEmployee]);

    const handleOpenModal = (availability?: Availability) => {
        store.prepareModal(availability);
        onOpen();
    };

    const handleSubmit = async (onSuccess?: () => void) => {
        try {
            await store.handleSubmit();
            // Refresh the schedule view as availability has changed
            await useDayStaffScheduleStore.getState().refresh();

            if (onSuccess) onSuccess();
            onOpenChange();
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to save availability");
        }
    };

    const handleDelete = async (id: string, onSuccess?: () => void) => {
        if (!confirm("Are you sure you want to delete this availability?")) return;
        try {
            await store.handleDelete(id);
            // Refresh the schedule view as availability has changed
            await useDayStaffScheduleStore.getState().refresh();

            if (onSuccess) onSuccess();
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to delete availability");
        }
    };

    return {
        ...store,
        loading,
        isOpen,
        onOpenChange,
        handleOpenModal,
        handleSubmit,
        handleDelete
    };
};
