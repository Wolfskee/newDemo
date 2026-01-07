"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@heroui/react";
import { apiGet } from "@/lib/api-client";
import { User, UserListResponse, Appointment } from "@/types/api";
import NotFoundCard from "./components/NotFoundCard";
import EmployeeInfoCard from "./components/EmployeeInfoCard";
import QuickActionsCard from "./components/QuickActionsCard";
import BookingCalendar from "@/components/BookingCalendar";

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const email = params.email as string;
  const decodedEmail = decodeURIComponent(email);

  const [employee, setEmployee] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<{ email: string; role: string } | null>(null);
  const [isNavExpanded, setIsNavExpanded] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("adminUser");
    if (!stored) {
      router.push("/admin");
    } else {
      const user = JSON.parse(stored);
      setAdminUser(user);
      fetchEmployeeData();
    }
  }, [router, email]);

  const fetchEmployeeData = async () => {
    try {
      // 获取用户列表，找到对应的员工
      const usersData: UserListResponse = await apiGet<UserListResponse>("user");
      const foundEmployee = usersData.users?.find(
        (u: User) => u.email === decodedEmail && (u.role === "EMPLOYEE" || u.role === "employee")
      );
      
      if (foundEmployee) {
        setEmployee(foundEmployee);
        
        // 使用 /appointment/user/{employeeId} 端点获取指定员工的所有预约
        const sanitizedEmployeeId = encodeURIComponent(foundEmployee.id.trim());
        const endpoint = `appointment/user/${sanitizedEmployeeId}`;
        
        try {
          // 获取所有预约（不添加日期过滤，以便在日历中显示所有预约）
          const appointmentsData: Appointment[] = await apiGet<Appointment[]>(endpoint);
          // 过滤出该员工的预约并排除已取消的预约
          const employeeAppointments = (appointmentsData || []).filter(
            (apt) => apt.employeeId === foundEmployee.id && apt.status !== "CANCELLED"
          );
          setAppointments(employeeAppointments);
        } catch (appointmentError) {
          console.error("Error fetching appointments:", appointmentError);
          // 即使预约获取失败，也继续显示员工信息
          setAppointments([]);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching employee data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <NotFoundCard
            message="Employee not found"
            backLabel="← Back to Employees"
            onBack={() => router.push("/admin/employees")}
          />
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* 左侧导航栏 */}
      <QuickActionsCard 
        adminUser={adminUser} 
        isExpanded={isNavExpanded}
        onToggle={() => setIsNavExpanded(!isNavExpanded)}
      />
      
      {/* 主内容区 */}
      <main 
        className={`
          flex-1 transition-all duration-300 ease-in-out
          lg:${isNavExpanded ? 'ml-64' : 'ml-20'}
        `}
      >
        <div className="py-4 md:py-8 px-3 sm:px-4">
          <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Employee Details
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
              Appointment history for {employee.username || employee.email}
            </p>
          </div>
          <Button
            color="default"
            variant="flat"
            onPress={() => router.push("/admin/employees")}
            size="sm"
            className="w-full sm:w-auto"
          >
            ← Back to Employees
          </Button>
        </div>

        <EmployeeInfoCard employee={employee} bookingsCount={appointments.length} />
        
        {/* 使用 BookingCalendar 显示员工的所有预约 */}
        <div className="mt-6">
          <BookingCalendar appointments={appointments} />
        </div>
          </div>
        </div>
      </main>
    </div>
  );
}
