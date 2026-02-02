"use client";

import { useState } from "react";
import BookingCalendar from "@/components/BookingCalendar";
import { apiDelete, apiPut, apiGet, apiPost } from "@/lib/api-client";
import { getAppointmentConfirmedEmail } from "@/lib/email-templates";
import { Appointment, User } from "@/types/api";

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
            // 1. 获取预约详情（用于获取 customerId，如果 appointments 列表中有可以直接用）
            const appointment = appointments.find(a => a.id === appointmentId);
            if (!appointment) {
                throw new Error("Appointment not found");
            }

            // 2. 更新预约状态为 CONFIRMED
            await apiPut(`appointment/${appointmentId}`, {
                status: "CONFIRMED"
            });

            // 3. 获取客户信息以发送邮件
            try {
                const customer = await apiGet<User>(`user/${appointment.customerId}`);
                if (customer && customer.email) {
                    const emailData = getAppointmentConfirmedEmail({
                        email: customer.email,
                        title: appointment.title,
                        date: appointment.date,
                        time: new Date(appointment.date).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false
                        }),
                        // 如果有当前登录的员工信息，也可以加上，这里暂时不加或者需要从 context/store 获取
                    });

                    await apiPost(
                        "api/send-email",
                        {
                            to: customer.email,
                            subject: emailData.subject,
                            html: emailData.html,
                        },
                        { skipAuth: true }
                    );
                    console.log("Confirmation email sent to", customer.email);
                }
            } catch (emailError) {
                console.error("Failed to send confirmation email:", emailError);
                // 不阻止确认操作，只是记录错误
            }

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

            <BookingCalendar
                appointments={appointments}
                onCancelAppointment={handleCancelAppointment}
                onConfirmAppointment={handleConfirmAppointment}
                showCancelButton={true}
                showConfirmButton={true}
            />
        </div>
    );
}