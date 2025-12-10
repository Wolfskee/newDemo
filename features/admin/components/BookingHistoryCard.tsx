"use client";

import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip } from "@nextui-org/react";
import { Booking } from "@/types/api";

interface BookingHistoryCardProps {
  bookings: Booking[];
}

export default function BookingHistoryCard({ bookings }: BookingHistoryCardProps) {
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

  return (
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
              No bookings found
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
