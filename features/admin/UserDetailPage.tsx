"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@heroui/react";
import { apiUrl } from "@/lib/api-config";
import { User, UserListResponse, Appointment, AppointmentListResponse } from "@/types/api";
import NotFoundCard from "./components/NotFoundCard";
import UserInfoCard from "./components/UserInfoCard";
import BookingHistoryCard from "./components/BookingHistoryCard";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for admin session
    const stored = localStorage.getItem("adminUser");
    if (!stored) {
      router.push("/admin");
    } else {
      fetchUserData();
    }
  }, [router, userId]);

  const fetchUserData = async () => {
    try {
      // 获取用户信息
      const userResponse = await fetch(apiUrl(`user/${userId}`));
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      } else if (userResponse.status === 404) {
        setUser(null);
      }

      // 获取用户的预约
      const appointmentsResponse = await fetch(apiUrl("appointment"));
      if (appointmentsResponse.ok) {
        const appointmentsData: AppointmentListResponse = await appointmentsResponse.json();
        const userAppointments = (appointmentsData.appointments || []).filter(
          (apt) => apt.customerId === userId
        );
        const sortedAppointments = userAppointments.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAppointments(sortedAppointments);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <NotFoundCard
            message="User not found"
            backLabel="← Back to Users"
            onBack={() => router.push("/admin/users")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              User Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Appointment history for {user.username || user.email}
            </p>
          </div>
          <Button
            color="default"
            variant="flat"
            onPress={() => router.push("/admin/users")}
          >
            ← Back to Users
          </Button>
        </div>

        <UserInfoCard user={user} bookingsCount={appointments.length} />
        <BookingHistoryCard appointments={appointments} />
      </div>
    </div>
  );
}
