"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Textarea,
  Select,
  SelectItem,
  Button,
  DatePicker,
} from "@heroui/react";
import { parseDate, CalendarDate } from "@internationalized/date";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPost } from "@/lib/api-client";
import { User, UserListResponse, Item, ItemListResponse, Appointment, AppointmentListResponse } from "@/types/api";
import { getAppointmentConfirmationEmail } from "@/lib/email-templates";

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
  const [services, setServices] = useState<Item[]>([]);
  const [employeeAppointments, setEmployeeAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // 获取员工列表和服务列表
  useEffect(() => {
    fetchEmployees();
    fetchServices();
  }, []);

  // 当选择员工时，获取该员工的预约
  useEffect(() => {
    if (formData.employeeId) {
      fetchEmployeeAppointments(formData.employeeId);
      // 清除已选择的日期和时间，因为员工变了
      setFormData((prev) => ({ ...prev, date: null, time: "" }));
    } else {
      setEmployeeAppointments([]);
    }
  }, [formData.employeeId]);

  const fetchEmployeeAppointments = async (employeeId: string) => {
    setIsLoadingAppointments(true);
    try {
      // 使用 /appointment/user/{employeeId} 端点获取指定员工的预约
      const sanitizedEmployeeId = encodeURIComponent(employeeId.trim());
      const endpoint = `appointment/user/${sanitizedEmployeeId}`;
      
      // 获取当前日期，格式化为 YYYY-MM-DD，用于筛选未来和今天的预约
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const currentDate = `${year}-${month}-${day}`;
      
      let appointments: Appointment[] = [];
      
      try {
        // 尝试使用 /appointment/user/{employeeId} 端点
        appointments = await apiGet<Appointment[]>(endpoint, {
          params: {
            date: currentDate
          }
        });
      } catch (apiError) {
        // 如果端点失败（例如 ID 格式问题），使用备用方案：获取所有预约然后过滤
        console.warn("Failed to fetch appointments by user endpoint, using fallback:", apiError);
        try {
          const data: AppointmentListResponse = await apiGet<AppointmentListResponse>("appointment");
          appointments = data.appointments || [];
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
          throw fallbackError;
        }
      }
      
      // 过滤出该员工的预约，排除已取消的预约
      const employeeAppts = appointments.filter(
        (apt) => apt.employeeId === employeeId && apt.status !== "CANCELLED"
      );
      
      // 过滤出今天及未来的预约
      const todayDate = new Date(currentDate);
      const futureAppts = employeeAppts.filter((apt) => {
        const appointmentDate = new Date(apt.date);
        return appointmentDate >= todayDate;
      });
      
      setEmployeeAppointments(futureAppts);
    } catch (error) {
      console.error("Error fetching employee appointments:", error);
      setEmployeeAppointments([]);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  // 检查某个日期和时间是否已被预订
  const isDateTimeBooked = (date: CalendarDate, time: string): boolean => {
    if (!date || !time) return false;
    
    const dateString = `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
    
    return employeeAppointments.some((apt) => {
      const appointmentDate = new Date(apt.date);
      const appointmentDateString = appointmentDate.toISOString().split("T")[0];
      const appointmentTime = appointmentDate.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });
      
      return appointmentDateString === dateString && appointmentTime === time;
    });
  };


  const fetchEmployees = async () => {
    try {
      const data: UserListResponse = await apiGet<UserListResponse>("user");
      const employeeList = (data.users || []).filter(
        (u: User) => u.role === "EMPLOYEE" || u.role === "employee"
      );
      setEmployees(employeeList);
      // 不再默认选择第一个员工，让用户先选择
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const data: ItemListResponse = await apiGet<ItemListResponse>("item");
      // 只获取 services (duration > 0 且状态为 ACTIVE)
      const serviceItems = (data.items || []).filter(
        (item) => item.duration && item.duration > 0 && (!item.status || item.status === "ACTIVE")
      );
      setServices(serviceItems);
      // 如果有服务，默认选择第一个
      if (serviceItems.length > 0 && !formData.title) {
        setFormData((prev) => ({ ...prev, title: serviceItems[0].name }));
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const sendAppointmentEmail = async (appointmentData: any, employee: User | undefined): Promise<boolean> => {
    try {
      const formattedDate = formData.date
        ? `${formData.date.year}-${String(formData.date.month).padStart(2, "0")}-${String(formData.date.day).padStart(2, "0")}`
        : "";
      
      const emailData = getAppointmentConfirmationEmail({
        email: user?.email || "",
        title: appointmentData.title,
        date: appointmentData.date,
        time: formData.time,
        employeeName: employee?.username || employee?.email,
      });

      await apiPost(
        "api/send-email",
        {
          to: user?.email,
          subject: emailData.subject,
          html: emailData.html,
        },
        { skipAuth: true }
      );
      return true; // 邮件发送成功
    } catch (error) {
      console.error("Error sending appointment confirmation email:", error);
      // 不阻止表单提交，即使邮件发送失败
      return false; // 邮件发送失败
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

      // 发送确认邮件
      const selectedEmployee = employees.find((emp) => emp.id === formData.employeeId);
      const emailSent = await sendAppointmentEmail(appointmentData, selectedEmployee);

      // 成功消息 - 根据邮件发送状态显示不同的消息
      if (emailSent) {
        setSubmitMessage("Booking Confirmed! ✓ A confirmation email has been sent to your email address.");
      } else {
        setSubmitMessage("Appointment created successfully! However, the confirmation email could not be sent.");
      }
      
      // 重新获取员工预约以更新可用时间
      if (formData.employeeId) {
        await fetchEmployeeAppointments(formData.employeeId);
      }
      
      setFormData({
        title: services.length > 0 ? services[0].name : "",
        description: "",
        date: null,
        time: "",
        employeeId: formData.employeeId, // 保持选中的员工
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
          {/* 1. 先选择员工 */}
          <Select
            label="Select Employee"
            placeholder="Choose an employee"
            selectedKeys={formData.employeeId ? [formData.employeeId] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              setFormData({ ...formData, employeeId: selected, date: null, time: "" });
            }}
            isRequired
            fullWidth
            description={isLoadingAppointments ? "Loading employee availability..." : undefined}
          >
            {employees.map((employee) => (
              <SelectItem key={employee.id}>
                {employee.username || employee.email}
              </SelectItem>
            ))}
          </Select>

          {/* 2. 选择服务 */}
          <Select
            label="Select Service"
            placeholder={services.length === 0 ? "No services available" : "Choose a service"}
            selectedKeys={formData.title ? [formData.title] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              setFormData({ ...formData, title: selected });
            }}
            isRequired
            isDisabled={services.length === 0 || !formData.employeeId}
            fullWidth
            description={
              services.length === 0
                ? "No services available at the moment"
                : !formData.employeeId
                ? "Please select an employee first"
                : undefined
            }
          >
            {services.map((service) => (
              <SelectItem key={service.name}>
                {service.name}
              </SelectItem>
            ))}
          </Select>

          {/* 3. 选择日期和时间 - 只有在选择了员工后才启用 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
              label="Select Date"
              value={formData.date}
              onChange={(date) => {
                setFormData({ ...formData, date, time: "" }); // 日期改变时清除时间选择
              }}
              isRequired
              isDisabled={!formData.employeeId}
              minValue={parseDate(new Date().toISOString().split("T")[0])}
              className="w-full"
              description={!formData.employeeId ? "Please select an employee first" : undefined}
            />
            <Select
              label="Select Time"
              placeholder={
                !formData.employeeId
                  ? "Select employee first"
                  : !formData.date
                  ? "Select date first"
                  : "Choose a time slot"
              }
              selectedKeys={formData.time ? [formData.time] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setFormData({ ...formData, time: selected });
              }}
              isRequired
              isDisabled={!formData.employeeId || !formData.date}
              fullWidth
              description={
                !formData.employeeId
                  ? "Please select an employee first"
                  : !formData.date
                  ? "Please select a date first"
                  : undefined
              }
            >
              {timeSlots.map((time) => {
                const isBooked = formData.date ? isDateTimeBooked(formData.date, time) : false;
                return (
                  <SelectItem
                    key={time}
                    isDisabled={isBooked}
                  >
                    {time} {isBooked ? "(Booked)" : ""}
                  </SelectItem>
                );
              })}
            </Select>
          </div>

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
            <div className="p-5 bg-success-100 dark:bg-success-900/30 border-2 border-success-400 dark:border-success-600 rounded-lg shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-success-600 dark:text-success-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-success-800 dark:text-success-300 font-semibold text-lg">
                  {submitMessage}
                </p>
              </div>
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
