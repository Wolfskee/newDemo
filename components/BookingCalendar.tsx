"use client";

import { useState, useMemo, useRef } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
} from "@heroui/react";
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
  parseISO,
} from "date-fns";
import { Appointment } from "@/types/api";

interface BookingCalendarProps {
  appointments: Appointment[];
  onCancelAppointment?: (appointmentId: string) => Promise<void>;
  onConfirmAppointment?: (appointmentId: string) => Promise<void>;
  showCancelButton?: boolean;
  showConfirmButton?: boolean;
  fullyBookedDates?: string[]; // 格式: ["2024-01-15", "2024-01-20"]
  onDateClick?: (date: string) => void; // 日期点击回调
  showDetails?: boolean; // 是否显示详情面板，默认为 true
}

export default function BookingCalendar({ appointments, onCancelAppointment, onConfirmAppointment, showCancelButton = false, showConfirmButton = false, fullyBookedDates = [], onDateClick, showDetails = true }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  // 获取指定日期的预约
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return appointments.filter((apt) => {
      const aptDate = parseISO(apt.date);
      return format(aptDate, "yyyy-MM-dd") === dateStr;
    });
  };

  // 生成日历天数
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

  // 格式化日期时间
  const formatDateTime = (dateString: string) => {
    const date = parseISO(dateString);
    return {
      date: format(date, "yyyy-MM-dd"),
      time: format(date, "HH:mm"),
      displayDate: format(date, "MMM dd, yyyy"),
      displayTime: format(date, "h:mm a"),
    };
  };

  // 滚动到日历位置的函数
  const scrollToCalendar = () => {
    if (calendarRef.current) {
      setTimeout(() => {
        calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  // 处理 appointment 点击
  const handleAppointmentClick = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setSelectedDate(formatDateTime(apt.date).date);
  };

  // 渲染 appointment details 内容
  const renderAppointmentDetails = (apt: Appointment | null) => {
    if (!apt) return null;
    
    return (
      <div className="space-y-4">
        <Card className="bg-primary-50 dark:bg-primary-900/20">
          <CardBody>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Title:</span>
                <p className="font-semibold">{apt.title}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Date:</span>
                <p className="font-semibold">{formatDateTime(apt.date).displayDate}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Time:</span>
                <div className="mt-1">
                  <Chip color="primary" size="sm">
                    {formatDateTime(apt.date).displayTime}
                  </Chip>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                <div className="mt-1">
                  <Chip 
                    color={
                      apt.status === "PENDING" ? "warning" :
                      apt.status === "CONFIRMED" ? "success" :
                      apt.status === "CANCELLED" ? "danger" :
                      "default"
                    } 
                    size="sm"
                  >
                    {apt.status}
                  </Chip>
                </div>
              </div>
              {apt.description && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Description:</span>
                  <p className="text-sm mt-1">{apt.description}</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
        <div className="flex gap-2 mt-4">
          {showConfirmButton && onConfirmAppointment && apt.status === "PENDING" && (
            <Button
              color="success"
              variant="flat"
              onPress={async () => {
                if (window.confirm("Are you sure you want to confirm this appointment?")) {
                  try {
                    await onConfirmAppointment(apt.id);
                    setSelectedAppointment(null);
                    setSelectedDate(null);
                    scrollToCalendar();
                  } catch (error) {
                    console.error("Error confirming appointment:", error);
                    alert("Failed to confirm appointment. Please try again.");
                  }
                }
              }}
            >
              Confirm Appointment
            </Button>
          )}
          {showCancelButton && onCancelAppointment && apt.status !== "CANCELLED" && (
            <Button
              color="danger"
              variant="flat"
              onPress={async () => {
                if (window.confirm("Are you sure you want to cancel this appointment?")) {
                  try {
                    await onCancelAppointment(apt.id);
                    setSelectedAppointment(null);
                    setSelectedDate(null);
                    scrollToCalendar();
                  } catch (error) {
                    console.error("Error canceling appointment:", error);
                    alert("Failed to cancel appointment. Please try again.");
                  }
                }
              }}
            >
              Cancel Appointment
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div ref={calendarRef}>
      <Card>
        <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
          <h3 className="text-xl sm:text-2xl font-semibold">Calendar</h3>
          <div className="flex items-center justify-center sm:justify-end gap-2">
            <Button
              size="sm"
              variant="flat"
              onPress={prevMonth}
            >
              ←
            </Button>
            <span className="text-base sm:text-lg font-semibold min-w-[140px] sm:min-w-[180px] text-center">
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
        <div className={`flex flex-col ${showDetails ? 'lg:flex-row' : ''} gap-6`}>
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
                const dateStr = format(day, "yyyy-MM-dd");
                const isFullyBooked = fullyBookedDates.includes(dateStr);

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (onDateClick && isCurrentMonth) {
                        onDateClick(dateStr);
                      }
                    }}
                    className={`min-h-[110px] sm:min-h-[120px] border rounded-lg p-1.5 sm:p-2 ${
                      isCurrentMonth
                        ? isFullyBooked
                          ? "bg-gray-300 dark:bg-gray-700 opacity-50 cursor-not-allowed"
                          : "bg-white dark:bg-gray-800"
                        : "bg-gray-50 dark:bg-gray-900"
                    } ${isToday ? "ring-2 ring-blue-500" : ""} ${onDateClick && isCurrentMonth && !isFullyBooked ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" : ""}`}
                  >
                    <div
                      className={`text-xs sm:text-sm font-medium mb-1 ${
                        isCurrentMonth
                          ? isFullyBooked
                            ? "text-gray-500 dark:text-gray-400 line-through"
                            : "text-gray-900 dark:text-white"
                          : "text-gray-400 dark:text-gray-600"
                      } ${isToday && !isFullyBooked ? "text-blue-600 dark:text-blue-400" : ""}`}
                    >
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 3).map((apt) => {
                        const { displayTime } = formatDateTime(apt.date);
                        const isCancelled = apt.status === "CANCELLED";
                        const isConfirmed = apt.status === "CONFIRMED";
                        const isPending = apt.status === "PENDING";
                        
                        let bgColor: string | undefined;
                        let textColor = "white";
                        
                        if (isCancelled) {
                          bgColor = "#f31260";
                        } else if (isConfirmed) {
                          bgColor = "#17c964";
                        } else if (isPending) {
                          bgColor = "#f5a524";
                        }
                        
                        return (
                          <div
                            key={apt.id}
                        onClick={() => {
                          if (showDetails) {
                            setSelectedAppointment(apt);
                            setSelectedDate(formatDateTime(apt.date).date);
                          } else if (onDateClick) {
                            onDateClick(formatDateTime(apt.date).date);
                          }
                        }}
                            className={`text-[10px] sm:text-xs p-1 rounded cursor-pointer truncate ${
                              bgColor
                                ? "hover:opacity-80"
                                : "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50"
                            }`}
                            style={bgColor ? { backgroundColor: bgColor, color: textColor } : undefined}
                            title={`${apt.title} - ${displayTime}`}
                          >
                            <div className="font-medium">{displayTime}</div>
                            <div className="truncate">{apt.title}</div>
                          </div>
                        );
                      })}
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
          {showDetails && (
            <div className="lg:w-80">
              {selectedAppointment ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-lg">Appointment Details</h4>
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
                {renderAppointmentDetails(selectedAppointment)}
              </div>
            ) : selectedDate ? (
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">
                  Appointments on {selectedDate}
                </h4>
                {appointments
                  .filter((apt) => formatDateTime(apt.date).date === selectedDate)
                  .map((apt) => {
                    const { displayTime } = formatDateTime(apt.date);
                    return (
                      <Card
                        key={apt.id}
                        className="cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                        onClick={() => setSelectedAppointment(apt)}
                      >
                        <CardBody>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">Time:</span>
                              <Chip color="primary" size="sm">
                                {displayTime}
                              </Chip>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">Title:</span>
                              <span className="text-sm">{apt.title}</span>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    );
                  })}
                {appointments.filter((apt) => formatDateTime(apt.date).date === selectedDate).length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400">
                    No appointments on this date
                  </p>
                )}
              </div>
            ) : (
              <div>
                <h4 className="font-semibold text-lg mb-4">All Appointments</h4>
                {appointments.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {appointments.map((apt) => {
                      const { displayDate, displayTime } = formatDateTime(apt.date);
                      return (
                        <Card
                          key={apt.id}
                          className="cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                        >
                          <CardBody
                            onClick={() => handleAppointmentClick(apt)}
                            className="cursor-pointer"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold">{displayDate}</span>
                                <Chip color="primary" size="sm">
                                  {displayTime}
                                </Chip>
                              </div>
                              <p className="text-sm">{apt.title}</p>
                            </div>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No appointments yet. Make your first appointment!
                  </p>
                )}
              </div>
            )}
            </div>
          )}
        </div>
      </CardBody>
      </Card>
    </div>
  );
}

