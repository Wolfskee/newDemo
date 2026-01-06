"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import DayStaffSchedule from "./components/DayStaffSchedule";

export default function SchedulingPage() {
    const router = useRouter();

    useEffect(() => {
        // Check admin permission
        const stored = localStorage.getItem("adminUser");
        if (!stored) {
            router.push("/admin");
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
                            Employee Scheduling
                        </h1>
                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 md:mt-2">
                            View and manage employee schedules
                        </p>
                    </div>
                    <Button
                        color="default"
                        variant="flat"
                        onPress={() => router.push("/admin/dashboard")}
                        size="sm"
                        className="w-full sm:w-auto"
                    >
                        ← Back to Dashboard
                    </Button>
                </div>

                <DayStaffSchedule />
            </div>
        </div>
    );
}