"use client";

import { Card, CardBody, Avatar } from "@heroui/react";
import { User } from "@/types/api";

interface ProfileCardProps {
    user: User;
}

export default function ProfileCard({ user }: ProfileCardProps) {
    return (
        <Card className="md:col-span-1">
            <CardBody className="items-center pt-8 pb-6">
                <Avatar
                    size="lg"
                    name={user.email}
                    fallback="👤"
                    className="w-24 h-24 mb-4"
                />
                <h2 className="text-xl font-semibold mb-2">{user.email}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User"}
                </p>
            </CardBody>
        </Card>
    );
}
