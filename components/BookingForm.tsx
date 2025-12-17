"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Textarea,
  Select,
  SelectItem,
  Button,
  DatePicker,
} from "@nextui-org/react";
import { parseDate, CalendarDate } from "@internationalized/date";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPost } from "@/lib/api-client";
import { User, UserListResponse } from "@/types/api";

const timeSlots = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

interface BookingFormProps {
  onBookingSuccess?: () => void;
}

export default function BookingForm({ onBookingSuccess }: BookingFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: null as CalendarDate | null,
    time: "",
    employeeId: "",
  });
  const [employees, setEmployees] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // 获取员工列表
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data: UserListResponse = await apiGet<UserListResponse>("user");
      const employeeList = (data.users || []).filter(
        (u: User) => u.role === "EMPLOYEE" || u.role === "employee"
      );
      setEmployees(employeeList);
      // 如果有员工，默认选择第一个
      if (employeeList.length > 0 && !formData.employeeId) {
        setFormData((prev) => ({ ...prev, employeeId: employeeList[0].id }));
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");
    setErrorMessage("");

    // 验证表单
    if (!formData.title || !formData.date || !formData.time || !formData.employeeId) {
      setErrorMessage("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    if (!user?.id) {
      setErrorMessage("Please login to make an appointment");
      setIsSubmitting(false);
      return;
    }

    try {
      // 组合日期和时间为 ISO 格式
      const dateString = formData.date
        ? `${formData.date.year}-${String(formData.date.month).padStart(2, "0")}-${String(formData.date.day).padStart(2, "0")}`
        : "";
      
      // 将时间转换为 24 小时格式
      const [hours, minutes] = formData.time.split(":");
      const dateTime = new Date(`${dateString}T${hours}:${minutes}:00`);
      const isoDateTime = dateTime.toISOString();

      const appointmentData = {
        title: formData.title,
        description: formData.description || "",
        date: isoDateTime,
        status: "PENDING",
        customerId: user.id,
        employeeId: formData.employeeId,
      };

      await apiPost("appointment", appointmentData);

      // 成功
      setSubmitMessage("Appointment created successfully!");
      setFormData({
        title: "",
        description: "",
        date: null,
        time: "",
        employeeId: employees.length > 0 ? employees[0].id : "",
      });
      
      // 调用成功回调
      if (onBookingSuccess) {
        onBookingSuccess();
      }
    } catch (error) {
      console.error("Error submitting appointment:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to submit appointment request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <h3 className="text-2xl font-semibold">Book a Service</h3>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Title"
            placeholder="Enter appointment title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            isRequired
            fullWidth
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
              label="Select Date"
              value={formData.date}
              onChange={(date) => setFormData({ ...formData, date })}
              isRequired
              minValue={parseDate(new Date().toISOString().split("T")[0])}
              className="w-full"
            />
            <Select
              label="Select Time"
              placeholder="Choose a time slot"
              selectedKeys={formData.time ? [formData.time] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setFormData({ ...formData, time: selected });
              }}
              isRequired
              fullWidth
            >
              {timeSlots.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </Select>
          </div>

          <Select
            label="Select Employee"
            placeholder="Choose an employee"
            selectedKeys={formData.employeeId ? [formData.employeeId] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              setFormData({ ...formData, employeeId: selected });
            }}
            isRequired
            fullWidth
          >
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.username || employee.email}
              </SelectItem>
            ))}
          </Select>

          <Textarea
            label="Description"
            placeholder="Tell us more about your requirements..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            minRows={4}
            fullWidth
          />

          {errorMessage && (
            <div className="p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
              <p className="text-danger-700 dark:text-danger-400">
                {errorMessage}
              </p>
            </div>
          )}

          {submitMessage && (
            <div className="p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
              <p className="text-success-700 dark:text-success-400">
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
            {isSubmitting ? "Submitting..." : "Submit Appointment"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
