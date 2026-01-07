"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  DatePicker,
  Chip,
} from "@heroui/react";
import { parseDate, CalendarDate } from "@internationalized/date";
import { apiPost } from "@/lib/api-client";

interface EmployeeAvailabilityFormProps {
  employeeId: string;
  onSuccess?: () => void;
}

export default function EmployeeAvailabilityForm({
  employeeId,
  onSuccess,
}: EmployeeAvailabilityFormProps) {
  const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]); // 存储 YYYY-MM-DD 格式的日期
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // 添加日期到列表
  const addDate = () => {
    if (!selectedDate) return;

    const dateString = `${selectedDate.year}-${String(selectedDate.month).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}`;
    
    // 检查是否已存在
    if (!availableDates.includes(dateString)) {
      setAvailableDates([...availableDates, dateString].sort());
      setSelectedDate(null);
    }
  };

  // 移除日期
  const removeDate = (dateString: string) => {
    setAvailableDates(availableDates.filter((d) => d !== dateString));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");
    setErrorMessage("");

    // 验证表单
    if (availableDates.length === 0) {
      setErrorMessage("Please add at least one available date");
      setIsSubmitting(false);
      return;
    }

    try {
      // 创建可用日期数据
      const availabilityData = {
        employeeId: employeeId,
        dates: availableDates, // 发送日期数组
      };

      console.log("Submitting availability:", availabilityData);

      // 调用 API 提交可用日期
      // 注意：这里假设后端有一个 /availability 或类似的端点
      // 如果端点不同，需要修改
      await apiPost("availability", availabilityData);

      setSubmitMessage(`Availability submitted successfully! ✓ ${availableDates.length} date(s) added.`);

      // 重置表单
      setAvailableDates([]);
      setSelectedDate(null);

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

  // 格式化日期显示
  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <h3 className="text-xl font-semibold">Submit Availability</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Select the dates you are available to work
        </p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              minValue={parseDate(new Date().toISOString().split("T")[0])}
              className="flex-1"
            />
            <Button
              type="button"
              color="primary"
              variant="flat"
              onPress={addDate}
              isDisabled={!selectedDate}
              className="mt-6"
            >
              Add
            </Button>
          </div>

          {/* 已选择的日期列表 */}
          {availableDates.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Selected Dates ({availableDates.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {availableDates.map((dateString) => (
                  <Chip
                    key={dateString}
                    onClose={() => removeDate(dateString)}
                    variant="flat"
                    color="primary"
                    className="cursor-pointer"
                  >
                    {formatDateDisplay(dateString)}
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

