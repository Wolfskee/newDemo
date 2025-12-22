"use client";

import { Button } from "@heroui/react";

interface CartHeaderProps {
    totalItems: number;
    onClearCart: () => void;
}

export default function CartHeader({ totalItems, onClearCart }: CartHeaderProps) {
    return (
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Shopping Cart ({totalItems} {totalItems === 1 ? "item" : "items"})
            </h1>
            <Button
                color="danger"
                variant="flat"
                onPress={onClearCart}
            >
                Clear Cart
            </Button>
        </div>
    );
}
