import { useRouter } from "next/navigation";
import { Item } from "@/types/api";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useProductsStore } from "../store/useProductsStore";

export const useAddToCart = () => {
    const router = useRouter();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { triggerAddToCartAnimation } = useProductsStore();

    const handleAddToCart = (product: Item, buttonElement: HTMLElement) => {
        if (!user) {
            router.push("/login");
            return;
        }

        const buttonRect = buttonElement.getBoundingClientRect();
        const startX = buttonRect.left + buttonRect.width / 2;
        const startY = buttonRect.top + buttonRect.height / 2;

        const cartButton = document.querySelector('[aria-label="Shopping Cart"]') as HTMLElement;
        let endX = window.innerWidth - 80;
        let endY = 60;

        if (cartButton) {
            const cartRect = cartButton.getBoundingClientRect();
            endX = cartRect.left + cartRect.width / 2;
            endY = cartRect.top + cartRect.height / 2;
        }

        triggerAddToCartAnimation(
            product,
            { x: startX, y: startY },
            { x: endX, y: endY },
            () => addToCart(product)
        );
    };

    return { handleAddToCart };
};
