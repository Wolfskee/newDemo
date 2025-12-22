"use client";

import { Card, CardBody, CardHeader, Button, Divider } from "@heroui/react";
import { User } from "@/types/api";

interface AccountInfoCardProps {
    user: User;
    onLogout: () => void;
}

export default function AccountInfoCard({ user, onLogout }: AccountInfoCardProps) {
    return (
        <Card className="md:col-span-2">
            <CardHeader>
                <h3 className="text-2xl font-semibold">Account Information</h3>
            </CardHeader>
            <CardBody className="space-y-4">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Email Address
                    </p>
                    <p className="text-lg">{user.email}</p>
                </div>
                <Divider />
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Account Type
                    </p>
                    <p className="text-lg">
                        {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User"}
                    </p>
                </div>
                <Divider />
                <div className="pt-4">
                    <Button
                        color="danger"
                        variant="flat"
                        onPress={onLogout}
                        fullWidth
                    >
                        Logout
                    </Button>
                </div>
            </CardBody>
        </Card>
    );
}
