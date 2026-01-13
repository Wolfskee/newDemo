"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  DatePicker,
  Chip,
  Input,
} from "@heroui/react";
import { parseDate, CalendarDate } from "@internationalized/date";
import { apiPost } from "@/lib/api-client";

interface EmployeeAvailabilityFormProps {
  employeeId: string;
  onSuccess?: () => void;
}

interface AvailabilitySlot {
  id: string;
  date: string; // YYYY-MM-DD 格式
  startTime: string; // HH:mm 格式
  endTime: string; // HH:mm 格式
}

export default function EmployeeAvailabilityForm({
  employeeId,
  onSuccess,
}: EmployeeAvailabilityFormProps) {
  const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(null);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // 添加时间段到列表
  const addSlot = () => {
    if (!selectedDate) {
      setErrorMessage("Please select a date");
      return;
    }

    if (!startTime || !endTime) {
      setErrorMessage("Please enter both start and end time");
      return;
    }

    // 验证时间
    if (startTime >= endTime) {
      setErrorMessage("End time must be after start time");
      return;
    }

    const dateString = `${selectedDate.year}-${String(selectedDate.month).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}`;
    
    const newSlot: AvailabilitySlot = {
      id: `${dateString}-${startTime}-${endTime}-${Date.now()}`,
      date: dateString,
      startTime,
      endTime,
    };

    // 检查是否已存在相同的时间段
    const exists = availableSlots.some(
      (slot) =>
        slot.date === dateString &&
        slot.startTime === startTime &&
        slot.endTime === endTime
    );

    if (exists) {
      setErrorMessage("This time slot already exists");
      return;
    }

    setAvailableSlots([...availableSlots, newSlot].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    }));
    setSelectedDate(null);
    setStartTime("09:00");
    setEndTime("17:00");
    setErrorMessage("");
  };

  // 移除时间段
  const removeSlot = (id: string) => {
    setAvailableSlots(availableSlots.filter((slot) => slot.id !== id));
  };

  // 将日期和时间组合成 ISO 格式 (UTC)
  const combineDateTime = (date: string, time: string): string => {
    const [hours, minutes] = time.split(":");
    // 使用 UTC 创建日期，避免时区转换问题
    const [year, month, day] = date.split("-").map(Number);
    const dateTime = new Date(Date.UTC(year, month - 1, day, parseInt(hours), parseInt(minutes), 0));
    return dateTime.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");
    setErrorMessage("");

    // 验证表单
    if (availableSlots.length === 0) {
      setErrorMessage("Please add at least one availability slot");
      setIsSubmitting(false);
      return;
    }

    try {
      // 为每个时间段单独发送请求
      const promises = availableSlots.map((slot) => {
        const availabilityData = {
          date: combineDateTime(slot.date, "00:00"), // 日期使用当天的 00:00:00
          startTime: combineDateTime(slot.date, slot.startTime),
          endTime: combineDateTime(slot.date, slot.endTime),
          status: "OPEN" as const,
          employeeId: employeeId,
        };

        console.log("Submitting availability:", availabilityData);
        return apiPost("availability", availabilityData);
      });

      // 等待所有请求完成
      await Promise.all(promises);

      setSubmitMessage(
        `Availability submitted successfully! ✓ ${availableSlots.length} slot(s) added.`
      );

      // 重置表单
      setAvailableSlots([]);
      setSelectedDate(null);
      setStartTime("09:00");
      setEndTime("17:00");

      // 调用成功回调
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting availability:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to submit availability. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 成功消息自动消失（5秒后）
  useEffect(() => {
    if (submitMessage) {
      const timer = setTimeout(() => {
        setSubmitMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitMessage]);

  // 格式化日期和时间显示
  const formatSlotDisplay = (slot: AvailabilitySlot) => {
    const date = new Date(slot.date + "T00:00:00");
    const dateStr = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    return `${dateStr} ${slot.startTime} - ${slot.endTime}`;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <h3 className="text-xl font-semibold">Submit Availability</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Select dates and time slots you are available to work
        </p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              minValue={parseDate(new Date().toISOString().split("T")[0])}
              fullWidth
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="time"
                label="Start Time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                fullWidth
              />
              <Input
                type="time"
                label="End Time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                fullWidth
              />
            </div>

            <Button
              type="button"
              color="primary"
              variant="flat"
              onPress={addSlot}
              isDisabled={!selectedDate || !startTime || !endTime}
              fullWidth
            >
              Add Time Slot
            </Button>
          </div>

          {/* 已选择的时间段列表 */}
          {availableSlots.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Selected Time Slots ({availableSlots.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {availableSlots.map((slot) => (
                  <Chip
                    key={slot.id}
                    onClose={() => removeSlot(slot.id)}
                    variant="flat"
                    color="primary"
                    className="cursor-pointer"
                  >
                    {formatSlotDisplay(slot)}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
              <p className="text-danger-700 dark:text-danger-400 text-sm">
                {errorMessage}
              </p>
            </div>
          )}

          {submitMessage && (
            <div className="p-4 bg-success-100 dark:bg-success-900/30 border-2 border-success-400 dark:border-success-600 rounded-lg">
              <p className="text-success-800 dark:text-success-300 font-semibold text-sm">
                {submitMessage}
              </p>
            </div>
          )}

          <Button
            type="submit"
            color="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            className="font-semibold"
          >
            {isSubmitting ? "Submitting..." : "Submit Availability"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

