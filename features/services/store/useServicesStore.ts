import { create } from 'zustand';
import { Item, ItemListResponse } from '@/types/api';
import { apiGet } from '@/lib/api-client';

interface ServicesStore {
    services: Item[];
    loading: boolean;
    error: string;
    fetchServices: () => Promise<void>;
    getActiveServices: () => Item[];
}

export const useServicesStore = create<ServicesStore>((set, get) => ({
    services: [],
    loading: true,
    error: "",

    fetchServices: async () => {
        set({ loading: true, error: "" });
        try {
            // 移除 skipAuth: true，使用认证 token（与 useProductsStore 保持一致）
            const data = await apiGet<ItemListResponse>("item");
            // 只显示 duration > 0 的 items（services）
            const serviceItems = (data.items || []).filter(
                (item) => item.duration && item.duration > 0
            );
            set({ services: serviceItems, loading: false });
        } catch (error) {
            console.error("Error fetching services:", error);
            set({ loading: false, error: "Failed to load services. Please try again later." });
        }
    },

    getActiveServices: () => {
        return get().services.filter(
            (service) => !service.status || service.status === "ACTIVE"
        );
    }
}));