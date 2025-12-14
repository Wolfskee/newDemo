"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@nextui-org/react";
import { apiUrl } from "@/lib/api-config";
import { User, UserListResponse, Appointment, AppointmentListResponse } from "@/types/api";
import NotFoundCard from "./components/NotFoundCard";
import EmployeeInfoCard from "./components/EmployeeInfoCard";
import BookingHistoryCard from "./components/BookingHistoryCard";

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const email = params.email as string;
  const decodedEmail = decodeURIComponent(email);

  const [employee, setEmployee] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("adminUser");
    if (!stored) {
      router.push("/admin");
    } else {
      fetchEmployeeData();
    }
  }, [router, email]);

  const fetchEmployeeData = async () => {
    try {
      // 获取用户列表，找到对应的员工
      const usersResponse = await fetch(apiUrl("user"));
      if (usersResponse.ok) {
        const usersData: UserListResponse = await usersResponse.json();
        const foundEmployee = usersData.users?.find(
          (u: User) => u.email === decodedEmail && (u.role === "EMPLOYEE" || u.role === "employee")
        );
        
        if (foundEmployee) {
          setEmployee(foundEmployee);
          
          // 获取员工的预约
          const appointmentsResponse = await fetch(apiUrl("appointment"));
          if (appointmentsResponse.ok) {
            const appointmentsData: AppointmentListResponse = await appointmentsResponse.json();
            const employeeAppointments = (appointmentsData.appointments || []).filter(
              (apt) => apt.employeeId === foundEmployee.id
            );
            const sortedAppointments = employeeAppointments.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setAppointments(sortedAppointments);
          }
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Employee Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Appointment history for {employee.username || employee.email}
            </p>
          </div>
          <Button
            color="default"
            variant="flat"
            onPress={() => router.push("/admin/employees")}
          >
            ← Back to Employees
          </Button>
        </div>

        <EmployeeInfoCard employee={employee} bookingsCount={appointments.length} />
        <BookingHistoryCard appointments={appointments} />
      </div>
    </div>
  );
}
