"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import BookingCalendar from "@/components/BookingCalendar";
import BookingForm from "@/components/BookingForm";
import { useProfileStore } from "./store/useProfileStore";
import ProfileHeader from "./components/ProfileHeader";
import ProfileCard from "./components/ProfileCard";
import AccountInfoCard from "./components/AccountInfoCard";
import SettingsCard from "./components/SettingsCard";
import ProfileLoadingSkeleton from "./components/ProfileLoadingSkeleton";
import ProfileError from "./components/ProfileError";
import { useProfileActions } from "./hooks/useProfileActions";

export default function ProfilePage() {
    const { user } = useAuth();
    const router = useRouter();
    const appointments = useProfileStore((state) => state.appointments);
    const loading = useProfileStore((state) => state.loading);
    const error = useProfileStore((state) => state.error);
    const fetchAppointments = useProfileStore((state) => state.fetchAppointments);
    const { handleLogout, handleBookingSuccess } = useProfileActions();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!user) {
            router.push("/login");
        } else if (user.id) {
            fetchAppointments(user.id);
        }
    }, [user, router, fetchAppointments]);

    // Scroll to booking form if hash is present
    useEffect(() => {
        if (window.location.hash === "#booking") {
            setTimeout(() => {
                const element = document.getElementById("booking");
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }, 100);
        }
    }, []);

    if (!user) {
        return null;
    }

    if (loading) {
        return <ProfileLoadingSkeleton />;
    }

    if (error) {
        return <ProfileError message={error} onRetry={() => user.id && fetchAppointments(user.id)} />;
    }

    return (
        <div className="min-h-screen bg-gray-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <ProfileHeader />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ProfileCard user={user} />
                    <AccountInfoCard user={user} onLogout={handleLogout} />
                </div>

                {/* Book a Service Form */}
                <div id="booking" className="mt-6 scroll-mt-6">
                    <BookingForm onBookingSuccess={handleBookingSuccess} />
                </div>

                {/* My Bookings Calendar */}
                <div className="mt-6">
                    <BookingCalendar appointments={appointments} />
                </div>

                {/* Settings Section */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-1 gap-6">
                    <SettingsCard />
                </div>
            </div>
        </div>
    );
}
