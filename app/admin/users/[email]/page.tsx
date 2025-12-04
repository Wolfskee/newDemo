"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Avatar,
} from "@nextui-org/react";

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

interface User {
  id: string;
  email: string;
  role: "user" | "admin" | "employee";
  createdAt: string;
  lastLogin?: string;
  bookingsCount?: number;
}

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
      // Fetch user info
      const usersResponse = await fetch("/api/users");
      const usersData = await usersResponse.json();
      if (usersData.success) {
        const foundUser = usersData.users.find(
          (u: User) => u.email === decodedEmail
        );
        setUser(foundUser || null);
      }

      // Fetch user bookings
      const bookingsResponse = await fetch(
        `/api/bookings?email=${encodeURIComponent(decodedEmail)}`
      );
      const bookingsData = await bookingsResponse.json();
      if (bookingsData.success) {
        // Sort bookings by date (newest first)
        const sortedBookings = bookingsData.bookings.sort(
          (a: Booking, b: Booking) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setBookings(sortedBookings);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                User not found
              </p>
              <Button
                className="mt-4"
                color="default"
                variant="flat"
                onPress={() => router.push("/admin/users")}
              >
                ← Back to Users
              </Button>
            </CardBody>
          </Card>
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
              Booking history for {decodedEmail}
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

        {/* User Info Card */}
        <Card className="mb-6">
          <CardBody className="p-6">
            <div className="flex items-center gap-6">
              <Avatar
                size="lg"
                name={user.email}
                fallback="👤"
                className="w-20 h-20"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-2">{user.email}</h2>
                <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-semibold">Role:</span>{" "}
                    <Chip
                      color={
                        user.role === "admin"
                          ? "danger"
                          : user.role === "employee"
                          ? "warning"
                          : "primary"
                      }
                      size="sm"
                      variant="flat"
                    >
                      {user.role.toUpperCase()}
                    </Chip>
                  </div>
                  <div>
                    <span className="font-semibold">Total Bookings:</span>{" "}
                    {bookings.length}
                  </div>
                  <div>
                    <span className="font-semibold">Member Since:</span>{" "}
                    {formatDate(user.createdAt)}
                  </div>
                  {user.lastLogin && (
                    <div>
                      <span className="font-semibold">Last Login:</span>{" "}
                      {formatDate(user.lastLogin)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Booking History */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">Booking History</h2>
          </CardHeader>
          <CardBody>
            {bookings.length > 0 ? (
              <Table aria-label="Booking history table">
                <TableHeader>
                  <TableColumn>DATE</TableColumn>
                  <TableColumn>TIME</TableColumn>
                  <TableColumn>SERVICE</TableColumn>
                  <TableColumn>NAME</TableColumn>
                  <TableColumn>DESCRIPTION</TableColumn>
                  <TableColumn>BOOKED AT</TableColumn>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-semibold">
                        {formatDate(booking.date)}
                      </TableCell>
                      <TableCell>{booking.time}</TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat" color="secondary">
                          {booking.service}
                        </Chip>
                      </TableCell>
                      <TableCell>{booking.name}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {booking.description || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDateTime(booking.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No bookings found for this user
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
