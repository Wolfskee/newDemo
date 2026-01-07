"use client";

import { useState, useEffect, useMemo } from "react";
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
  const [allEmployeesAppointments, setAllEmployeesAppointments] = useState<Map<string, Appointment[]>>(new Map());
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // 获取员工列表和服务列表
  useEffect(() => {
    fetchEmployees();
    fetchServices();
  }, []);

  // 成功消息自动消失（5秒后）
  useEffect(() => {
    if (submitMessage) {
      const timer = setTimeout(() => {
        setSubmitMessage("");
      }, 5000); // 5秒后清除消息

      return () => {
        clearTimeout(timer);
      };
    }
  }, [submitMessage]);

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

  // 当日期改变时，如果没有选择员工，获取所有员工的预约
  useEffect(() => {
    if (!formData.employeeId && formData.date && employees.length > 0) {
      fetchAllEmployeesAppointments();
    }
  }, [formData.date, formData.employeeId, employees.length]);

  // 获取所有员工的预约信息
  const fetchAllEmployeesAppointments = async () => {
    if (employees.length === 0) return;
    
    setIsLoadingAppointments(true);
    try {
      const appointmentsMap = new Map<string, Appointment[]>();
      
      // 获取当前日期
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const currentDate = `${year}-${month}-${day}`;
      
      // 并行获取所有员工的预约
      const appointmentPromises = employees.map(async (employee) => {
        try {
          const sanitizedEmployeeId = encodeURIComponent(employee.id.trim());
          const endpoint = `appointment/user/${sanitizedEmployeeId}`;
          
          let appointments: Appointment[] = [];
          try {
            appointments = await apiGet<Appointment[]>(endpoint, {
              params: {
                date: currentDate
              }
            });
          } catch (apiError) {
            // 如果端点失败，使用备用方案
            try {
              const data: AppointmentListResponse = await apiGet<AppointmentListResponse>("appointment");
              appointments = data.appointments || [];
            } catch (fallbackError) {
              console.error(`Failed to fetch appointments for employee ${employee.id}:`, fallbackError);
              return { employeeId: employee.id, appointments: [] };
            }
          }
          
          // 过滤出该员工的预约，排除已取消的预约
          const employeeAppts = appointments.filter(
            (apt) => apt.employeeId === employee.id && apt.status !== "CANCELLED"
          );
          
          // 过滤出今天及未来的预约
          const todayDate = new Date(currentDate);
          const futureAppts = employeeAppts.filter((apt) => {
            const appointmentDate = new Date(apt.date);
            return appointmentDate >= todayDate;
          });
          
          return { employeeId: employee.id, appointments: futureAppts };
        } catch (error) {
          console.error(`Error fetching appointments for employee ${employee.id}:`, error);
          return { employeeId: employee.id, appointments: [] };
        }
      });
      
      const results = await Promise.all(appointmentPromises);
      results.forEach(({ employeeId, appointments }) => {
        appointmentsMap.set(employeeId, appointments);
      });
      
      setAllEmployeesAppointments(appointmentsMap);
    } catch (error) {
      console.error("Error fetching all employees appointments:", error);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

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

  // 检查某个日期和时间是否已被预订（针对特定员工）
  const isDateTimeBooked = (date: CalendarDate, time: string, employeeId?: string): boolean => {
    if (!date || !time) return false;
    
    const dateString = `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
    
    // 如果指定了员工ID，检查该员工的预约
    if (employeeId) {
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
    }
    
    // 如果没有指定员工，检查是否所有员工在这个日期和时间都被预订了
    // 只有当所有员工都被预订时，才返回 true
    if (employees.length === 0) return false;
    
    const dateStringForCheck = dateString;
    const timeForCheck = time;
    
    // 检查每个员工是否在这个日期和时间有预约
    const allEmployeesBooked = employees.every((employee) => {
      const employeeAppts = allEmployeesAppointments.get(employee.id) || [];
      
      return employeeAppts.some((apt) => {
        const appointmentDate = new Date(apt.date);
        const appointmentDateString = appointmentDate.toISOString().split("T")[0];
        const appointmentTime = appointmentDate.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        });
        
        return appointmentDateString === dateStringForCheck && appointmentTime === timeForCheck;
      });
    });
    
    return allEmployeesBooked;
  };

  // 查找在指定日期和时间可用的员工
  const findAvailableEmployee = (date: CalendarDate, time: string): User | null => {
    if (!date || !time || employees.length === 0) return null;
    
    const dateString = `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
    
    // 获取所有可用的员工
    const availableEmployees = employees.filter((employee) => {
      const employeeAppts = allEmployeesAppointments.get(employee.id) || [];
      
      // 检查该员工在这个日期和时间是否有预约
      const hasConflict = employeeAppts.some((apt) => {
        const appointmentDate = new Date(apt.date);
        const appointmentDateString = appointmentDate.toISOString().split("T")[0];
        const appointmentTime = appointmentDate.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        });
        
        return appointmentDateString === dateString && appointmentTime === time;
      });
      
      return !hasConflict;
    });
    
    // 如果没有可用的员工，返回 null
    if (availableEmployees.length === 0) return null;
    
    // 随机选择一个可用的员工
    const randomIndex = Math.floor(Math.random() * availableEmployees.length);
    return availableEmployees[randomIndex];
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
    if (!formData.title || !formData.date || !formData.time) {
      setErrorMessage("Please fill in all required fields (Service, Date, and Time)");
      setIsSubmitting(false);
      return;
    }

    if (!user?.id) {
      setErrorMessage("Please login to make an appointment");
      setIsSubmitting(false);
      return;
    }

    try {
      // 如果没有选择员工，自动分配一个可用的员工
      let selectedEmployeeId = formData.employeeId;
      let selectedEmployee: User | undefined;
      
      if (!selectedEmployeeId) {
        // 确保已获取所有员工的预约信息
        if (allEmployeesAppointments.size === 0 && employees.length > 0) {
          await fetchAllEmployeesAppointments();
        }
        
        // 查找可用的员工
        const availableEmployee = findAvailableEmployee(formData.date!, formData.time);
        
        if (!availableEmployee) {
          setErrorMessage("No employees are available at the selected date and time. Please choose a different time slot.");
          setIsSubmitting(false);
          return;
        }
        
        selectedEmployeeId = availableEmployee.id;
        selectedEmployee = availableEmployee;
      } else {
        // 如果已选择员工，验证该员工是否可用
        if (isDateTimeBooked(formData.date!, formData.time, selectedEmployeeId)) {
          setErrorMessage("The selected employee is not available at the chosen time. Please select a different time or employee.");
          setIsSubmitting(false);
          return;
        }
        selectedEmployee = employees.find((emp) => emp.id === selectedEmployeeId);
      }
      
      // 组合日期和时间为 ISO 格式
      const dateString = formData.date
        ? `${formData.date.year}-${String(formData.date.month).padStart(2, "0")}-${String(formData.date.day).padStart(2, "0")}`
        : "";
      
      // 将时间转换为 24 小时格式
      const [hours, minutes] = formData.time.split(":");
      
      // 创建日期时间对象（使用本地时区）
      // 注意：这里使用本地时区创建日期，然后转换为 ISO 字符串
      // 如果后端需要 UTC 时间，toISOString() 会自动转换
      const dateTime = new Date(`${dateString}T${hours}:${minutes}:00`);
      
      // 验证日期时间是否有效
      if (isNaN(dateTime.getTime())) {
        throw new Error("Invalid date or time selected");
      }
      
      const isoDateTime = dateTime.toISOString();
      console.log("Date string:", dateString, "Time:", formData.time, "ISO DateTime:", isoDateTime);

      const appointmentData = {
        title: formData.title,
        description: formData.description || "",
        date: isoDateTime,
        status: "PENDING",
        customerId: user.id,
        employeeId: selectedEmployeeId,
      };

      console.log("Submitting appointment:", appointmentData);

      // 创建预约
      let createdAppointment;
      try {
        createdAppointment = await apiPost("appointment", appointmentData);
        console.log("Appointment created successfully:", createdAppointment);
        
        // 验证返回的数据
        if (!createdAppointment || (createdAppointment && !createdAppointment.id)) {
          throw new Error("Appointment creation failed: Invalid response from server");
        }
      } catch (apiError) {
        console.error("Error creating appointment:", apiError);
        throw apiError; // 重新抛出错误，让 catch 块处理
      }

      // 发送确认邮件（即使邮件发送失败，也不影响预约创建）
      let emailSent = false;
      try {
        emailSent = await sendAppointmentEmail(appointmentData, selectedEmployee);
      } catch (emailError) {
        console.error("Email sending failed, but appointment was created:", emailError);
        // 邮件发送失败不影响预约创建，继续执行
      }

      // 成功消息 - 根据邮件发送状态显示不同的消息
      const employeeName = selectedEmployee?.username || selectedEmployee?.email || "an employee";
      if (emailSent) {
        setSubmitMessage(
          `Booking Confirmed! ✓ A confirmation email has been sent to your email address. ${!formData.employeeId ? `Assigned to: ${employeeName}` : ""}`
        );
      } else {
        setSubmitMessage(
          `Appointment created successfully! However, the confirmation email could not be sent. ${!formData.employeeId ? `Assigned to: ${employeeName}` : ""}`
        );
      }
      
      // 重新获取员工预约以更新可用时间
      if (selectedEmployeeId) {
        await fetchEmployeeAppointments(selectedEmployeeId);
      }
      
      // 如果没有选择员工，重新获取所有员工的预约
      if (!formData.employeeId) {
        await fetchAllEmployeesAppointments();
      }
      
      setFormData({
        title: services.length > 0 ? services[0].name : "",
        description: "",
        date: null,
        time: "",
        employeeId: "", // 重置员工选择
      });
      
      // 调用成功回调
      if (onBookingSuccess) {
        onBookingSuccess();
      }
    } catch (error) {
      console.error("Error submitting appointment:", error);
      
      // 提供更详细的错误信息
      let errorMsg = "Failed to submit appointment request. Please try again.";
      
      if (error instanceof Error) {
        errorMsg = error.message;
        
        // 根据错误类型提供更友好的错误消息
        if (error.message.includes("401") || error.message.includes("Unauthorized")) {
          errorMsg = "You are not authorized. Please log in again.";
        } else if (error.message.includes("403") || error.message.includes("Forbidden")) {
          errorMsg = "You don't have permission to create appointments.";
        } else if (error.message.includes("400") || error.message.includes("Bad Request")) {
          errorMsg = "Invalid appointment data. Please check your selections.";
        } else if (error.message.includes("409") || error.message.includes("Conflict")) {
          errorMsg = "This time slot is already booked. Please choose a different time.";
        } else if (error.message.includes("404") || error.message.includes("Not Found")) {
          errorMsg = "Service endpoint not found. Please contact support.";
        } else if (error.message.includes("500") || error.message.includes("Internal Server Error")) {
          errorMsg = "Server error. Please try again later.";
        }
      }
      
      setErrorMessage(errorMsg);
      setSubmitMessage(""); // 清除任何成功消息
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
          {/* 1. 选择员工（可选） */}
          <Select
            label="Select Employee (Optional)"
            placeholder="Choose an employee or leave empty for auto-assignment"
            selectedKeys={formData.employeeId ? [formData.employeeId] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              setFormData({ ...formData, employeeId: selected || "", date: null, time: "" });
            }}
            fullWidth
            description={
              isLoadingAppointments 
                ? "Loading employee availability..." 
                : formData.employeeId 
                ? undefined 
                : "If not selected, an available employee will be automatically assigned"
            }
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
            fullWidth
            description={
              services.length === 0
                ? "No services available at the moment"
                : undefined
            }
          >
            {services.map((service) => (
              <SelectItem key={service.name}>
                {service.name}
              </SelectItem>
            ))}
          </Select>

          {/* 3. 选择日期和时间 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
              label="Select Date"
              value={formData.date}
              onChange={(date) => {
                setFormData({ ...formData, date, time: "" }); // 日期改变时清除时间选择
              }}
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
              isDisabled={!formData.date}
              fullWidth
              description={
                !formData.date
                  ? "Please select a date first"
                  : !formData.employeeId
                  ? "Checking availability across all employees..."
                  : undefined
              }
            >
              {timeSlots.map((time) => {
                const isBooked = formData.date 
                  ? isDateTimeBooked(formData.date, time, formData.employeeId || undefined) 
                  : false;
                return (
                  <SelectItem
                    key={time}
                    textValue={time}
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
