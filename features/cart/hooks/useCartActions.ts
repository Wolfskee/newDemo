import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

export const useCartActions = () => {
    const router = useRouter();
    const { user } = useAuth();
    const { cart, removeFromCart, updateQuantity, clearCart, getTotalItems } = useCart();

    const handleRemoveFromCart = (itemId: string) => {
        removeFromCart(itemId);
    };

    const handleUpdateQuantity = (itemId: string, quantity: number) => {
        updateQuantity(itemId, quantity);
    };

    const handleClearCart = () => {
        if (confirm("Are you sure you want to clear your cart?")) {
            clearCart();
        }
    };

    const calculateTotals = () => {
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const tax = subtotal * 0.1;
        const total = subtotal + tax;
        return { subtotal, tax, total };
    };

    return {
        cart,
        getTotalItems,
        handleRemoveFromCart,
        handleUpdateQuantity,
        handleClearCart,
        calculateTotals,
        isAuthenticated: !!user,
    };
};
