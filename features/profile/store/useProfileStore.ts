import { create } from 'zustand';
import { Appointment } from '@/types/api';
import { apiGet } from '@/lib/api-client';

interface ProfileStore {
    appointments: Appointment[];
    loading: boolean;
    error: string;
    fetchAppointments: (userId: string) => Promise<void>;
}

export const useProfileStore = create<ProfileStore>((set) => ({
    appointments: [],
    loading: true,
    error: "",

    fetchAppointments: async (userId: string) => {
        // 输入验证：确保 userId 是有效的非空字符串
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            const errorMsg = "Invalid user ID provided";
            console.error(errorMsg);
            set({ 
                loading: false, 
                error: errorMsg,
                appointments: []
            });
            return;
        }

        set({ loading: true, error: "" });
        
        try {
            // 获取当前日期，格式化为 YYYY-MM-DD
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const currentDate = `${year}-${month}-${day}`;
            
            // 使用路径参数的安全方式：appointment/user/{userId}
            // 确保 userId 被正确编码，防止路径注入攻击
            const sanitizedUserId = encodeURIComponent(userId.trim());
            const endpoint = `appointment/user/${sanitizedUserId}`;
            
            // 调用 API，传入 date 参数筛选今天及往后的预约
            const appointments: Appointment[] = await apiGet<Appointment[]>(endpoint, {
                params: {
                    date: currentDate
                }
            });
            
            // 验证返回的数据结构
            if (!Array.isArray(appointments)) {
                throw new Error("Invalid response format from server");
            }
            
            // 后端已经过滤了，但前端再做一次验证确保数据正确
            const validAppointments = appointments.filter(
                (apt) => apt && apt.customerId === userId
            );
            
            set({ 
                appointments: validAppointments, 
                loading: false,
                error: ""
            });
        } catch (error) {
            console.error("Error fetching appointments:", error);
            
            // 提供更详细的错误信息
            let errorMessage = "Failed to load appointments. Please try again later.";
            if (error instanceof Error) {
                // 如果是 404，说明用户不存在或没有预约
                if (error.message.includes('404') || error.message.includes('Not Found')) {
                    errorMessage = "No appointments found for this user.";
                } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                    errorMessage = "You are not authorized to view these appointments.";
                } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
                    errorMessage = "Access denied. You cannot view these appointments.";
                } else {
                    errorMessage = error.message || errorMessage;
                }
            }
            
            set({ 
                loading: false, 
                error: errorMessage,
                appointments: []
            });
        }
    },
}));
