"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartActions } from "./hooks/useCartActions";
import CartHeader from "./components/CartHeader";
import CartItemCard from "./components/CartItemCard";
import OrderSummaryCard from "./components/OrderSummaryCard";
import EmptyCartAlert from "./components/EmptyCartAlert";

export default function CartPage() {
    const router = useRouter();
    const {
        cart,
        getTotalItems,
        handleRemoveFromCart,
        handleUpdateQuantity,
        handleClearCart,
        calculateTotals,
        isAuthenticated,
    } = useCartActions();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return null;
    }

    const { subtotal, tax, total } = calculateTotals();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-900 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8 text-white">
                        Shopping Cart
                    </h1>
                    <EmptyCartAlert />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <CartHeader totalItems={getTotalItems()} onClearCart={handleClearCart} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                            <CartItemCard
                                key={item.id}
                                item={item}
                                onUpdateQuantity={handleUpdateQuantity}
                                onRemove={handleRemoveFromCart}
                            />
                        ))}
                    </div>

                    <div className="lg:col-span-1">
                        <OrderSummaryCard
                            subtotal={subtotal}
                            tax={tax}
                            total={total}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
