import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthStore } from "../store/useAuthStore";

export const useLogin = () => {
    const router = useRouter();
    const { setUser, setAuthTokens } = useAuth();
    const { login, loading, error } = useAuthStore();

    const handleSubmit = async (email: string, password: string) => {
        // 客户端验证
        if (!email.trim()) {
            return;
        }

        if (!password) {
            return;
        }

        try {
            const authData = await login(email, password);

            // 保存 tokens
            if (authData.accessToken && authData.refreshToken) {
                setAuthTokens(authData.accessToken, authData.refreshToken);
            }

            // 如果有用户信息，保存用户信息
            if (authData.user) {
                setUser(authData.user);
            } else {
                // 如果没有用户信息，使用占位符
                setUser({
                    id: "",
                    username: email.trim(),
                    email: email.trim(),
                    role: "CUSTOMER",
                    phone: "",
                    createdAt: "",
                    updatedAt: "",
                });
            }

            // 根据角色跳转
            const userRole = authData.user?.role?.toUpperCase();
            if (userRole === "ADMIN" || userRole === "admin") {
                router.push("/admin/dashboard");
            } else {
                router.push("/");
            }
            router.refresh();
        } catch (err) {
            // 错误已在 store 中处理
            console.error("Login error:", err);
        }
    };

    return {
        handleSubmit,
        loading,
        error,
    };
};


