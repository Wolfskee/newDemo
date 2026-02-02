import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Alert, Button } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";

export type ToastColor = "default" | "primary" | "secondary" | "success" | "warning" | "danger";

export interface Toast {
    id: string;
    message: string;
    color?: ToastColor;
    duration?: number;
}

interface ToastContextType {
    addToast: (message: string, options?: { color?: ToastColor; duration?: number }) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((message: string, options?: { color?: ToastColor; duration?: number }) => {
        const id = Math.random().toString(36).substring(7);
        const duration = options?.duration || 3000;

        const newToast = { id, message, ...options };

        setToasts((prev) => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className="pointer-events-auto"
                        >
                            <Alert
                                color={toast.color || "default"}
                                variant="faded"
                                onClose={() => removeToast(toast.id)}
                                title={toast.message}
                                classNames={{
                                    base: "shadow-lg bg-background/90"
                                }}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
