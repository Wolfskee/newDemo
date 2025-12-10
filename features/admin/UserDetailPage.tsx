"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@nextui-org/react";
import { apiUrl } from "@/lib/api-config";
import { Booking, User } from "@/types/api";
import NotFoundCard from "./components/NotFoundCard";
import UserInfoCard from "./components/UserInfoCard";
import BookingHistoryCard from "./components/BookingHistoryCard";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const email = params.email as string;
  const decodedEmail = decodeURIComponent(email);

  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for admin session
    const stored = localStorage.getItem("adminUser");
    if (!stored) {
      router.push("/admin");
    } else {
      fetchUserData();
    }
  }, [router, email]);

  const fetchUserData = async () => {
    try {
      const usersResponse = await fetch(apiUrl("api/user"));
      if (!usersResponse.ok) {
        throw new Error("Failed to fetch users");
      }
      const usersData = await usersResponse.json();
      const foundUser = usersData.users?.find(
        (u: User) => u.email === decodedEmail
      );
      
      if (foundUser) {
        setUser(foundUser);
        const userDetailResponse = await fetch(apiUrl(`api/user/${foundUser.id}`));
        if (userDetailResponse.ok) {
          const userDetail = await userDetailResponse.json();
          setUser(userDetail);
        }
      }

      const bookingsResponse = await fetch(
        apiUrl(`api/bookings?email=${encodeURIComponent(decodedEmail)}`)
      );
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        if (bookingsData.success) {
          const sortedBookings = bookingsData.bookings.sort(
            (a: Booking, b: Booking) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setBookings(sortedBookings);
        }
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
              Booking history for {user.username || user.email}
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

        <UserInfoCard user={user} bookingsCount={bookings.length} />
        <BookingHistoryCard bookings={bookings} />
      </div>
    </div>
  );
}
