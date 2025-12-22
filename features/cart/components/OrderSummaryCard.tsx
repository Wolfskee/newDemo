"use client";

import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import { useRouter } from "next/navigation";

interface OrderSummaryCardProps {
    subtotal: number;
    tax: number;
    total: number;
}

export default function OrderSummaryCard({ subtotal, tax, total }: OrderSummaryCardProps) {
    const router = useRouter();

    return (
        <Card>
            <CardHeader>
                <h2 className="text-2xl font-semibold">Order Summary</h2>
            </CardHeader>
            <CardBody className="space-y-4">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
                <Button
                    color="primary"
                    size="lg"
                    fullWidth
                    className="mt-4"
                >
                    Proceed to Checkout
                </Button>
                <Button
                    color="default"
                    variant="flat"
                    fullWidth
                    onPress={() => router.push("/products")}
                >
                    Continue Shopping
                </Button>
            </CardBody>
        </Card>
    );
}


