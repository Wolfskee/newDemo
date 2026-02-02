import { useRef, useEffect } from 'react';
import { useEmployeeAvailabilityStore } from '../store/useEmployeeAvailabilityStore';

export const useEmployeeAvailabilityForm = (employeeId: string, onSuccess?: () => void) => {
    const store = useEmployeeAvailabilityStore();

    // Clear messages on unmount or success after timeout
    useEffect(() => {
        if (store.submitMessage) {
            const timer = setTimeout(() => {
                store.clearMessages();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [store.submitMessage]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await store.submitAvailability(employeeId);
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            // Error is handled in store (setting errorMessage)
        }
    };

    return {
        ...store,
        handleSubmit: handleFormSubmit
    };
};
