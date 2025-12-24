"use client";

import { Card, CardBody, Button, Image, Input } from "@heroui/react";
import { Item } from "@/types/api";

interface CartItem extends Item {
    quantity: number;
}

interface CartItemCardProps {
    item: CartItem;
    onUpdateQuantity: (itemId: string, quantity: number) => void;
    onRemove: (itemId: string) => void;
}

export default function CartItemCard({ item, onUpdateQuantity, onRemove }: CartItemCardProps) {
    return (
        <Card>
            <CardBody>
                <div className="flex gap-4">
                    <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={120}
                        height={120}
                        className="object-cover rounded"
                    />
                    <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2 text-white">{item.name}</h3>
                        {item.category && (
                            <p className="text-sm text-gray-400 mb-2">
                                {item.category}
                            </p>
                        )}
                        <p className="text-lg font-bold text-primary mb-4">
                            ${item.price.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-400">Quantity:</label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity.toString()}
                                    onChange={(e) => {
                                        const qty = parseInt(e.target.value) || 1;
                                        onUpdateQuantity(item.id, qty);
                                    }}
                                    className="w-20"
                                    size="sm"
                                />
                            </div>
                            <Button
                                size="sm"
                                color="danger"
                                variant="flat"
                                onPress={() => onRemove(item.id)}
                            >
                                Remove
                            </Button>
                        </div>
                        <p className="text-lg font-semibold mt-2 text-white">
                            Subtotal: ${(item.price * item.quantity).toFixed(2)}
                        </p>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
