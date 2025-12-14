"use client";

import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip } from "@nextui-org/react";
import { Appointment } from "@/types/api";
import { format, parseISO } from "date-fns";

interface BookingHistoryCardProps {
  appointments: Appointment[];
}

export default function BookingHistoryCard({ appointments }: BookingHistoryCardProps) {
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMM dd, yyyy");
  };

  const formatDateTime = (dateString: string) => {
    return format(parseISO(dateString), "MMM dd, yyyy h:mm a");
  };

  const formatTime = (dateString: string) => {
    return format(parseISO(dateString), "h:mm a");
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-semibold">Appointment History</h2>
      </CardHeader>
      <CardBody>
        <Table aria-label="Appointment history table">
          <TableHeader>
            <TableColumn>DATE</TableColumn>
            <TableColumn>TIME</TableColumn>
            <TableColumn>TITLE</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>DESCRIPTION</TableColumn>
            <TableColumn>CREATED AT</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No appointments found">
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell className="font-semibold">
                  {formatDate(appointment.date)}
                </TableCell>
                <TableCell>{formatTime(appointment.date)}</TableCell>
                <TableCell>{appointment.title}</TableCell>
                <TableCell>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={
                      appointment.status === "PENDING" ? "warning" :
                      appointment.status === "CONFIRMED" ? "success" :
                      appointment.status === "CANCELLED" ? "danger" :
                      "default"
                    }
                  >
                    {appointment.status}
                  </Chip>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {appointment.description || "-"}
                </TableCell>
                <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDateTime(appointment.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}
