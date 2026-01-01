"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Hero from "@/components/Hero";
import ProductsSection from "@/components/ProductsSection";
import ServicesSection from "@/components/ServicesSection";
import GoogleMap from "@/components/GoogleMap";
import BookingCalendar from "@/components/BookingCalendar";
import { Button } from "@heroui/react";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api-client";
import { Appointment, AppointmentListResponse } from "@/types/api";

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

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [fullyBookedDates, setFullyBookedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取所有员工的预约
  useEffect(() => {
    fetchAllAppointments();
  }, []);

  const fetchAllAppointments = async () => {
    setLoading(true);
    try {
      // 使用 GET /appointment 端点获取所有预约
      const data: AppointmentListResponse = await apiGet<AppointmentListResponse>("appointment");
      const allAppts = (data.appointments || []).filter(
        (apt) => apt.status !== "CANCELLED"
      );

      setAllAppointments(allAppts);
      
      // 计算fully booked的日期
      // 逻辑：如果某个日期的所有时间段（考虑所有员工）都被预订，则该日期为fully booked
      const fullyBooked: string[] = [];
      const dateEmployeeTimeMap = new Map<string, Map<string, Set<string>>>(); // date -> employeeId -> Set of time slots
      
      allAppts.forEach((apt) => {
        const aptDate = new Date(apt.date);
        const dateStr = aptDate.toISOString().split("T")[0];
        const timeStr = aptDate.toTimeString().split(" ")[0].slice(0, 5); // HH:MM
        
        if (!dateEmployeeTimeMap.has(dateStr)) {
          dateEmployeeTimeMap.set(dateStr, new Map());
        }
        const employeeMap = dateEmployeeTimeMap.get(dateStr)!;
        if (!employeeMap.has(apt.employeeId)) {
          employeeMap.set(apt.employeeId, new Set());
        }
        employeeMap.get(apt.employeeId)!.add(timeStr);
      });
      
      // 获取所有唯一的员工ID
      const allEmployeeIds = new Set<string>();
      allAppts.forEach((apt) => {
        allEmployeeIds.add(apt.employeeId);
      });
      
      // 检查每个日期是否所有员工的所有时间段都被占用
      dateEmployeeTimeMap.forEach((employeeMap, dateStr) => {
        // 检查是否所有员工在该日期的所有时间段都被占用
        let allEmployeesFullyBooked = true;
        for (const employeeId of allEmployeeIds) {
          const timeSet = employeeMap.get(employeeId);
          // 如果员工没有预约记录，或者预约的时间段数量少于总时间段数，则该员工还有可用时间段
          if (!timeSet || timeSet.size < timeSlots.length) {
            allEmployeesFullyBooked = false;
            break;
          }
        }
        // 如果所有员工的所有时间段都被占用，则标记为fully booked
        if (allEmployeeIds.size > 0 && allEmployeesFullyBooked) {
          fullyBooked.push(dateStr);
        }
      });
      
      setFullyBookedDates(fullyBooked);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date: string) => {
    if (!user) {
      router.push("/login");
    } else {
      // 如果已登录，可以跳转到预约页面或显示预约表单
      router.push("/profile#booking");
    }
  };

  return (
    <main className="min-h-screen">
      <Hero />
      <ProductsSection />
      <ServicesSection />
      
      {/* Booking Calendar Section */}
      <div className="py-12 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Book an Appointment
          </h2>
          <BookingCalendar
            appointments={allAppointments}
            fullyBookedDates={fullyBookedDates}
            onDateClick={handleDateClick}
            showDetails={false}
          />
        </div>
      </div>
      
      <GoogleMap />
    </main>
  );
}
