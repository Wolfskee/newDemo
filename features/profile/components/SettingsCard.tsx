"use client";

import { Card, CardBody, CardHeader, Button } from "@heroui/react";

export default function SettingsCard() {
    return (
        <Card>
            <CardHeader>
                <h3 className="text-xl font-semibold text-white">Settings</h3>
            </CardHeader>
            <CardBody>
                <p className="text-gray-400">
                    Manage your account settings and preferences
                </p>
                <Button
                    className="mt-4"
                    color="primary"
                    variant="flat"
                    fullWidth
                >
                    Account Settings
                </Button>
            </CardBody>
        </Card>
    );
}
