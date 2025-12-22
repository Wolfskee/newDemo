import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/useAuthStore";

interface RegisterFormData {
    username: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
}

export const useRegister = () => {
    const router = useRouter();
    const { register, loading, error: storeError } = useAuthStore();
    const [error, setError] = useState("");

    const handleSubmit = async (data: RegisterFormData) => {
        setError("");

        // 验证必填字段
        if (!data.username.trim()) {
            setError("Username is required");
            return;
        }

        if (!data.email.trim()) {
            setError("Email is required");
            return;
        }

        if (!data.phone.trim()) {
            setError("Phone number is required");
            return;
        }

        if (data.password !== data.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (data.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        try {
            const authData = await register({
                username: data.username,
                email: data.email,
                password: data.password,
                phone: data.phone,
                role: "CUSTOMER",
            });

            // 注册成功，跳转到登录页
            router.push("/login");
            router.refresh();
        } catch (err) {
            // 错误已在 store 中处理，但如果有客户端验证错误，使用客户端错误
            if (!error && storeError) {
                setError(storeError);
            }
            console.error("Registration error:", err);
        }
    };

    return {
        handleSubmit,
        loading,
        error: error || storeError,
    };
};


