import { create } from 'zustand';
import { apiPost } from '@/lib/api-client';
import { AuthResponse } from '@/types/api';

interface AuthStore {
    loading: boolean;
    error: string;
    login: (email: string, password: string) => Promise<AuthResponse>;
    register: (data: {
        username: string;
        email: string;
        password: string;
        phone: string;
        role: string;
    }) => Promise<AuthResponse>;
}

export const useAuthStore = create<AuthStore>((set) => ({
    loading: false,
    error: "",

    login: async (email: string, password: string) => {
        set({ loading: true, error: "" });
        try {
            const authData: AuthResponse = await apiPost<AuthResponse>(
                "auth/login",
                {
                    email: email.trim(),
                    password: password,
                },
                { skipAuth: true }
            );
            set({ loading: false });
            return authData;
        } catch (error) {
            console.error("Login error:", error);
            const errorMessage = error instanceof Error ? error.message : "An error occurred. Please try again.";
            set({ loading: false, error: errorMessage });
            throw error;
        }
    },

    register: async (data) => {
        set({ loading: true, error: "" });
        try {
            const authData: AuthResponse = await apiPost<AuthResponse>(
                "auth/register",
                {
                    username: data.username.trim(),
                    email: data.email.trim(),
                    password: data.password,
                    role: data.role,
                    phone: data.phone.trim(),
                },
                { skipAuth: true }
            );
            set({ loading: false });
            return authData;
        } catch (error) {
            console.error("Registration error:", error);
            const errorMessage = error instanceof Error ? error.message : "An error occurred. Please try again.";
            set({ loading: false, error: errorMessage });
            throw error;
        }
    },
}));
