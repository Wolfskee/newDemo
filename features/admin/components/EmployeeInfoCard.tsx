"use client";

import { Card, CardBody, Avatar, Chip } from "@nextui-org/react";
import { User } from "@/types/api";

interface EmployeeInfoCardProps {
  employee: User;
  bookingsCount: number;
}

export default function EmployeeInfoCard({ employee, bookingsCount }: EmployeeInfoCardProps) {
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
            name={employee.username || employee.email}
            fallback="👤"
            className="w-20 h-20"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-2">{employee.username || employee.email}</h2>
            <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-semibold">Email:</span> {employee.email}
              </div>
              <div>
                <span className="font-semibold">Phone:</span> {employee.phone}
              </div>
              <div>
                <span className="font-semibold">Role:</span>{" "}
                <Chip size="sm" variant="flat" color="warning">
                  EMPLOYEE
                </Chip>
              </div>
              <div>
                <span className="font-semibold">Total Bookings:</span>{" "}
                {bookingsCount}
              </div>
              <div>
                <span className="font-semibold">Member Since:</span>{" "}
                {formatDate(employee.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}


