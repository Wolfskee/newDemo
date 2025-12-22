import { useRouter } from "next/navigation";
import { useAdminAuthStore } from "../store/useAdminAuthStore";
import { setTokens } from "@/lib/api-client";

export const useAdminLogin = () => {
    const router = useRouter();
    const { login, loading, error } = useAdminAuthStore();

    const handleSubmit = async (email: string, password: string) => {
        if (!email.trim() || !password) {
            return;
        }

        try {
            const authData = await login(email, password);

            // 保存 tokens
            if (authData.accessToken && authData.refreshToken) {
                setTokens(authData.accessToken, authData.refreshToken);
            }

            // 存储管理员/员工会话信息
            const adminUserData = {
                id: authData.user?.id || "",
                email: authData.user?.email || email.trim(),
                role: authData.user?.role || "",
            };
            localStorage.setItem("adminUser", JSON.stringify(adminUserData));

            router.push("/admin/dashboard");
            router.refresh();
        } catch (err) {
            // 错误已在 store 中处理
            console.error("Admin login error:", err);
        }
    };

    return {
        handleSubmit,
        loading,
        error,
    };
};


