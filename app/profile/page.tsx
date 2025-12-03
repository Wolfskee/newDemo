"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Avatar,
  Button,
  Divider,
} from "@nextui-org/react";
import { useAuth } from "@/contexts/AuthContext";
import BookingCalendar from "@/components/BookingCalendar";

interface Booking {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  service: string;
  description?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      setLoading(false);
      fetchBookings();
    }
  }, [user, router]);

  const fetchBookings = async () => {
    if (!user?.email) return;
    
    try {
      const response = await fetch(`/api/bookings?email=${encodeURIComponent(user.email)}`);
      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          My Profile
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
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

          {/* Account Information */}
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
                  onPress={handleLogout}
                  fullWidth
                >
                  Logout
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* My Bookings Calendar */}
        <div className="mt-6">
          <BookingCalendar bookings={bookings} />
        </div>

        {/* Additional Sections */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-1 gap-6">

          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Settings</h3>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 dark:text-gray-400">
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
        </div>
      </div>
    </div>
  );
}
