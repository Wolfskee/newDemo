import { create } from 'zustand';
import { Item, FlyingItem, ItemListResponse } from '@/types/api';
import { apiGet } from '@/lib/api-client';

interface ProductsState {
    products: Item[];
    loading: boolean;
    error: string;
    flyingItems: FlyingItem[];
    fetchProducts: () => Promise<void>;
    addFlyingItem: (item: FlyingItem) => void;
    removeFlyingItem: (id: string) => void;
    triggerAddToCartAnimation: (
        product: Item,
        startPos: { x: number; y: number },
        endPos: { x: number; y: number },
        onComplete: () => void
    ) => void;
}

export const useProductsStore = create<ProductsState>((set) => ({
    products: [],
    loading: true,
    error: "",
    flyingItems: [],

    fetchProducts: async () => {
        set({ loading: true, error: "" });
        try {
            const data = await apiGet<ItemListResponse>("item");
            const productItems = (data.items || []).filter(
                (item) => !item.duration || item.duration === 0
            );
            set({ products: productItems, loading: false });
        } catch (error) {
            console.error("Error fetching products:", error);
            set({ loading: false, error: "Failed to load products. Please try again later." });
        }
    },

    addFlyingItem: (item) => set((state) => ({ flyingItems: [...state.flyingItems, item] })),

    removeFlyingItem: (id) => set((state) => ({
        flyingItems: state.flyingItems.filter((i) => i.id !== id)
    })),

    triggerAddToCartAnimation: (product: Item, startPos: { x: number, y: number }, endPos: { x: number, y: number }, onComplete: () => void) => {
        const flyingItem: FlyingItem = {
            id: `${product.id}-${Date.now()}`,
            product,
            startX: startPos.x,
            startY: startPos.y,
            endX: endPos.x,
            endY: endPos.y,
        };

        set((state) => ({ flyingItems: [...state.flyingItems, flyingItem] }));

        // 动画完成后执行回调并移除动画项
        setTimeout(() => {
            onComplete();
            set((state) => ({
                flyingItems: state.flyingItems.filter((i) => i.id !== flyingItem.id)
            }));
        }, 800);
    }
}));
