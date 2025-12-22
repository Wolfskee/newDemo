import { create } from 'zustand';
import { apiPost } from '@/lib/api-client';
import { AuthResponse } from '@/types/api';

interface AdminAuthStore {
    loading: boolean;
    error: string;
    login: (email: string, password: string) => Promise<AuthResponse>;
}

export const useAdminAuthStore = create<AdminAuthStore>((set) => ({
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

            // 验证用户角色是否为管理员或员工
            const userRole = authData.user?.role?.toUpperCase();
            if (userRole !== "ADMIN" && userRole !== "EMPLOYEE") {
                const errorMsg = "This account is not authorized to access the admin portal.";
                set({ loading: false, error: errorMsg });
                throw new Error(errorMsg);
            }

            set({ loading: false });
            return authData;
        } catch (error) {
            console.error("Admin login error:", error);
            const errorMessage = error instanceof Error ? error.message : "An error occurred. Please try again.";
            set({ loading: false, error: errorMessage });
            throw error;
        }
    },
}));
