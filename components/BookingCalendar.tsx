"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
} from "@nextui-org/react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";

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

interface BookingCalendarProps {
  bookings: Booking[];
}

export default function BookingCalendar({ bookings }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Booking | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return bookings.filter((booking) => booking.date === dateStr);
  };

  // Generate calendar days
  const daysInMonth = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <h3 className="text-2xl font-semibold">My Bookings</h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="flat"
              onPress={prevMonth}
            >
              ←
            </Button>
            <span className="text-lg font-semibold min-w-[180px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button
              size="sm"
              variant="flat"
              onPress={nextMonth}
            >
              →
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            {/* Calendar Header - Week Days */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 p-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {daysInMonth.map((day, idx) => {
                const dayAppointments = getAppointmentsForDate(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={idx}
                    className={`min-h-[110px] sm:min-h-[120px] border rounded-lg p-1.5 sm:p-2 ${
                      isCurrentMonth
                        ? "bg-white dark:bg-gray-800"
                        : "bg-gray-50 dark:bg-gray-900"
                    } ${isToday ? "ring-2 ring-blue-500" : ""}`}
                  >
                    <div
                      className={`text-xs sm:text-sm font-medium mb-1 ${
                        isCurrentMonth
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-400 dark:text-gray-600"
                      } ${isToday ? "text-blue-600 dark:text-blue-400" : ""}`}
                    >
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 3).map((apt) => (
                        <div
                          key={apt.id}
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setSelectedDate(apt.date);
                          }}
                          className={`text-[10px] sm:text-xs p-1 rounded cursor-pointer truncate ${
                            "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50"
                          }`}
                          title={`${apt.service} - ${apt.time}`}
                        >
                          <div className="font-medium">{apt.time}</div>
                          <div className="truncate">{apt.service}</div>
                        </div>
                      ))}
                      {dayAppointments.length > 3 && (
                        <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 text-center">
                          +{dayAppointments.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="lg:w-80">
            {selectedAppointment ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-lg">Booking Details</h4>
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() => {
                      setSelectedAppointment(null);
                      setSelectedDate(null);
                    }}
                  >
                    ✕
                  </Button>
                </div>
                <Card className="bg-primary-50 dark:bg-primary-900/20">
                  <CardBody>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Date:</span>
                        <p className="font-semibold">{selectedAppointment.date}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Time:</span>
                        <div className="mt-1">
                          <Chip color="primary" size="sm">
                            {selectedAppointment.time}
                          </Chip>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Service:</span>
                        <p className="font-semibold mt-1">{selectedAppointment.service}</p>
                      </div>
                      {selectedAppointment.description && (
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Description:</span>
                          <p className="text-sm mt-1">{selectedAppointment.description}</p>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </div>
            ) : selectedDate ? (
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">
                  Bookings on {selectedDate}
                </h4>
                {bookings
                  .filter((b) => b.date === selectedDate)
                  .map((booking) => (
                    <Card
                      key={booking.id}
                      className="cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                      onClick={() => setSelectedAppointment(booking)}
                    >
                      <CardBody>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Time:</span>
                            <Chip color="primary" size="sm">
                              {booking.time}
                            </Chip>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Service:</span>
                            <span className="text-sm">{booking.service}</span>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                {bookings.filter((b) => b.date === selectedDate).length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400">
                    No bookings on this date
                  </p>
                )}
              </div>
            ) : (
              <div>
                <h4 className="font-semibold text-lg mb-4">All Bookings</h4>
                {bookings.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {bookings.map((booking) => (
                      <Card
                        key={booking.id}
                        className="cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                        onClick={() => {
                          setSelectedDate(booking.date);
                          setSelectedAppointment(booking);
                        }}
                      >
                        <CardBody>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{booking.date}</span>
                              <Chip color="primary" size="sm">
                                {booking.time}
                              </Chip>
                            </div>
                            <p className="text-sm">{booking.service}</p>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No bookings yet. Make your first booking!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
