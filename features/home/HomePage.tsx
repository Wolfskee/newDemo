"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import Hero from "@/components/Hero";
import ProductsSection from "@/components/ProductsSection";
import ServicesSection from "@/components/ServicesSection";
import GoogleMap from "@/components/GoogleMap";
import BookingCalendar from "@/components/BookingCalendar";
import { Button } from "@heroui/react";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api-client";
import { Appointment, AppointmentListResponse, User, UserListResponse } from "@/types/api";

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
  const [employees, setEmployees] = useState<User[]>([]);
  const [availableTimeSlotsByDate, setAvailableTimeSlotsByDate] = useState<Map<string, string[]>>(new Map());

  const fetchEmployees = async () => {
    try {
      const data: UserListResponse = await apiGet<UserListResponse>("user");
      const employeeList = (data.users || []).filter(
        (u: User) => u.role === "EMPLOYEE" || u.role === "employee"
      );
      setEmployees(employeeList);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchAllAppointments = async () => {
    setLoading(true);
    try {
      // 使用 GET /appointment 端点获取所有预约
      const data: AppointmentListResponse = await apiGet<AppointmentListResponse>("appointment");
      const allAppts = (data.appointments || []).filter(
        (apt) => apt.status !== "CANCELLED"
      );

      setAllAppointments(allAppts);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAvailableTimeSlots = useCallback(() => {
    if (employees.length === 0) {
      // 如果没有员工，所有时间段都可用
      const availableSlotsMap = new Map<string, string[]>();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      for (let i = 0; i < 60; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = format(date, "yyyy-MM-dd");
        availableSlotsMap.set(dateStr, [...timeSlots]);
      }
      setAvailableTimeSlotsByDate(availableSlotsMap);
      setFullyBookedDates([]);
      return;
    }

    // 获取所有员工ID（从employees状态获取）
    const allEmployeeIds = new Set(employees.map(emp => emp.id));
    
    // 计算fully booked的日期和可用时间段
    const fullyBooked: string[] = [];
    const dateEmployeeTimeMap = new Map<string, Map<string, Set<string>>>(); // date -> employeeId -> Set of time slots
    
    allAppointments.forEach((apt) => {
      // 使用 parseISO 来正确解析 ISO 格式的日期时间字符串
      const aptDate = parseISO(apt.date);
      const dateStr = format(aptDate, "yyyy-MM-dd");
      // 使用 format 确保格式与 timeSlots 一致 (HH:mm)
      const timeStr = format(aptDate, "HH:mm");
      
      if (!dateEmployeeTimeMap.has(dateStr)) {
        dateEmployeeTimeMap.set(dateStr, new Map());
      }
      const employeeMap = dateEmployeeTimeMap.get(dateStr)!;
      if (!employeeMap.has(apt.employeeId)) {
        employeeMap.set(apt.employeeId, new Set());
      }
      employeeMap.get(apt.employeeId)!.add(timeStr);
    });
    
    // 计算每个日期的可用时间段
    const availableSlotsMap = new Map<string, string[]>();
    
    // 获取所有日期（从今天开始，未来60天）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = format(date, "yyyy-MM-dd");
      
      // 计算该日期每个时间段的可用性
      // 如果某个时间段至少有一个员工没有预约，则该时间段可用
      const availableSlots: string[] = [];
      const employeeMap = dateEmployeeTimeMap.get(dateStr);
      
      timeSlots.forEach((slot) => {
        // 检查该时间段是否所有员工都已预订
        let allEmployeesBooked = true;
        
        // 检查是否所有员工在该时间段都有预约
        for (const employeeId of allEmployeeIds) {
          const timeSet = employeeMap?.get(employeeId);
          if (!timeSet || !timeSet.has(slot)) {
            // 如果某个员工在该时间段没有预约，则该时间段可用
            allEmployeesBooked = false;
            break;
          }
        }
        
        // 如果至少有一个员工没有预约，则该时间段可用
        if (!allEmployeesBooked) {
          availableSlots.push(slot);
        }
      });
      
      
      availableSlotsMap.set(dateStr, availableSlots);
      
      // 如果所有时间段都被预订，标记为fully booked
      if (availableSlots.length === 0 && allEmployeeIds.size > 0) {
        fullyBooked.push(dateStr);
      }
    }
    
    setFullyBookedDates(fullyBooked);
    setAvailableTimeSlotsByDate(availableSlotsMap);
  }, [employees, allAppointments]);

  // 获取所有员工的预约和员工列表
  useEffect(() => {
    const loadData = async () => {
      await fetchEmployees();
      await fetchAllAppointments();
    };
    loadData();
  }, []);
  
  // 当employees和appointments更新时，重新计算可用时间段
  useEffect(() => {
    calculateAvailableTimeSlots();
  }, [calculateAvailableTimeSlots]);

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
            availableTimeSlotsByDate={availableTimeSlotsByDate}
            timeSlots={timeSlots}
          />
        </div>
      </div>
      
      <GoogleMap />
    </main>
  );
}
