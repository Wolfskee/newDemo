"use client";

import { useState } from "react";
import BookingCalendar from "@/components/BookingCalendar";
import { Appointment } from "@/types/api";
import { apiDelete, apiPut } from "@/lib/api-client";

interface MyAppointmentsSectionProps {
    appointments: Appointment[];
    onAppointmentsUpdate: () => void;
}

export default function MyAppointmentsSection({ appointments, onAppointmentsUpdate }: MyAppointmentsSectionProps) {
    const [isCanceling, setIsCanceling] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

    const handleCancelAppointment = async (appointmentId: string) => {
        setIsCanceling(true);
        try {
            // 使用 DELETE 请求删除预约
            await apiDelete(`appointment/${appointmentId}`);
            // 通知父组件刷新预约列表
            onAppointmentsUpdate();
        } catch (error) {
            console.error("Error canceling appointment:", error);
            throw error;
        } finally {
            setIsCanceling(false);
        }
    };

    const handleConfirmAppointment = async (appointmentId: string) => {
        setIsConfirming(true);
        try {
            // 更新预约状态为 CONFIRMED
            await apiPut(`appointment/${appointmentId}`, {
                status: "CONFIRMED"
            });
            // 通知父组件刷新预约列表
            onAppointmentsUpdate();
        } catch (error) {
            console.error("Error confirming appointment:", error);
            throw error;
        } finally {
            setIsConfirming(false);
        }
    };

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">
                My Appointments
            </h2>
            {appointments.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                    <p className="text-gray-400">No appointments found</p>
                </div>
            ) : (
                <BookingCalendar 
                    appointments={appointments} 
                    onCancelAppointment={handleCancelAppointment}
                    onConfirmAppointment={handleConfirmAppointment}
                    showCancelButton={true}
                    showConfirmButton={true}
                />
            )}
        </div>
    );
}