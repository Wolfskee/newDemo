"use client";

import { Card, CardBody, Avatar, Chip } from "@heroui/react";
import { User } from "@/types/api";

interface UserInfoCardProps {
  user: User;
  bookingsCount: number;
}

export default function UserInfoCard({ user, bookingsCount }: UserInfoCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="mb-6">
      <CardBody className="p-6">
        <div className="flex items-center gap-6">
          <Avatar
            size="lg"
            name={user.username || user.email}
            fallback="👤"
            className="w-20 h-20"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-2">{user.username || user.email}</h2>
            <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-semibold">Email:</span> {user.email}
              </div>
              <div>
                <span className="font-semibold">Phone:</span> {user.phone}
              </div>
              <div>
                <span className="font-semibold">Role:</span>{" "}
                <Chip
                  color={
                    user.role === "ADMIN"
                      ? "danger"
                      : "primary"
                  }
                  size="sm"
                  variant="flat"
                >
                  {user.role}
                </Chip>
              </div>
              <div>
                <span className="font-semibold">Total Bookings:</span>{" "}
                {bookingsCount}
              </div>
              <div>
                <span className="font-semibold">Member Since:</span>{" "}
                {formatDate(user.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}


