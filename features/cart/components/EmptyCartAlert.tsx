"use client";

import { Card, CardBody, Button } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function EmptyCartAlert() {
    const router = useRouter();

    return (
        <Card>
            <CardBody className="text-center py-16">
                <p className="text-2xl text-gray-400 mb-4">
                    Cart is Empty
                </p>
                <Button
                    color="primary"
                    onPress={() => router.push("/products")}
                >
                    Continue Shopping
                </Button>
            </CardBody>
        </Card>
    );
}
