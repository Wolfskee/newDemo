"use client";

import BookingCalendar from "@/components/BookingCalendar";
import { Appointment } from "@/types/api";

interface MyAppointmentsSectionProps {
    appointments: Appointment[];
}

export default function MyAppointmentsSection({ appointments }: MyAppointmentsSectionProps) {
    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">
                My Appointments
            </h2>
            <BookingCalendar appointments={appointments} />
        </div>
    );
}