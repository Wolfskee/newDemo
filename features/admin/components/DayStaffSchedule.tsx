"use client";

import {useMemo, useState, useEffect} from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Autocomplete,
  AutocompleteItem,
  Spinner,
} from "@heroui/react";
import { apiGet, apiPut } from "@/lib/api-client";
import { User, UserListResponse, Availability } from "@/types/api";
import EmployeeAvailabilityForm from "./EmployeeAvailabilityForm";

type Employee = { id: string; name: string; email?: string; phone?: string; role?: string };
type Assignment = { 
  employeeId: string; 
  date: string; // date: YYYY-MM-DD
  availabilityId?: string;
  startTime?: string;
  endTime?: string;
};

const LOCALE = "en-US";

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday start
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function toISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function isToday(d: Date) {
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}
function fmtWeekRange(days: Date[]) {
  const start = days[0].toLocaleDateString(LOCALE, {month: "long", day: "numeric"});
  const end = days[6].toLocaleDateString(LOCALE, {month: "long", day: "numeric"});
  return `${start} — ${end}`;
}
function formatTimeRange(startTime: string, endTime: string): string {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    // 使用 24 小时制，更紧凑
    const startHours = String(start.getUTCHours()).padStart(2, "0");
    const startMinutes = String(start.getUTCMinutes()).padStart(2, "0");
    const endHours = String(end.getUTCHours()).padStart(2, "0");
    const endMinutes = String(end.getUTCMinutes()).padStart(2, "0");
    return `${startHours}:${startMinutes}-${endHours}:${endMinutes}`;
  } catch (e) {
    return "";
  }
}

interface DayStaffScheduleProps {
  readOnly?: boolean; // 如果为 true，则只显示不能更改
  employeeId?: string; // 员工ID，用于在只读模式下显示可用性表单
}

export default function DayStaffSchedule({ readOnly = false, employeeId }: DayStaffScheduleProps) {
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [usersById, setUsersById] = useState<Map<string, User>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 自动跳转到今天所在的周（组件挂载时）
  useEffect(() => {
    const today = new Date();
    const todayWeekStart = startOfWeek(today);
    setWeekStart(todayWeekStart);
  }, []); // 只在组件挂载时执行一次

  // modal state
  const [open, setOpen] = useState(false);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // 从后端获取员工数据
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        const data: UserListResponse = await apiGet<UserListResponse>("user");
        // 过滤出员工角色
        const employeeList = (data.users || []).filter(
          (user: User) => user.role === "EMPLOYEE" || user.role === "employee"
        );
        // 转换为组件需要的格式
        const formattedEmployees: Employee[] = employeeList.map((user: User) => ({
          id: user.id,
          name: user.username || user.email,
          email: user.email,
          phone: user.phone,
          role: user.role === "EMPLOYEE" || user.role === "employee" ? "Employee" : undefined,
        }));
        setEmployees(formattedEmployees);
        
        // 存储完整的用户信息映射（包括所有用户，不仅仅是员工）
        const userMap = new Map<string, User>();
        (data.users || []).forEach((user: User) => {
          userMap.set(user.id, user);
        });
        setUsersById(userMap);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch employees");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const days = useMemo(
    () => Array.from({length: 7}, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const employeesById = useMemo(() => {
    return new Map(employees.map((e) => [e.id, e]));
  }, [employees]);

  // 从 API 获取当前周所有 ASSIGNED 状态的 availability
  useEffect(() => {
    const fetchAssignedAvailabilities = async () => {
      if (loading) return; // 等待员工数据加载完成
      
      try {
        setLoadingAssignments(true);
        const assignedList: Assignment[] = [];
        
        // 获取当前周每一天的 ASSIGNED availability
        for (const day of days) {
          const dateStr = toISODate(day);
          try {
            // 获取该日期的所有 availability
            const response = await apiGet<any>(
              "availability",
              {
                params: { date: dateStr },
              }
            );
            
            // 处理不同的响应格式
            let availabilities: Availability[] = [];
            if (Array.isArray(response)) {
              availabilities = response;
            } else if (response?.availabilities && Array.isArray(response.availabilities)) {
              availabilities = response.availabilities;
            } else if (response?.data && Array.isArray(response.data)) {
              availabilities = response.data;
            }
            
            // 过滤出 ASSIGNED 状态的 availability
            const assigned = availabilities.filter((a: Availability) => a.status === "ASSIGNED");
            assigned.forEach((a: Availability) => {
              assignedList.push({
                date: dateStr,
                employeeId: a.employeeId,
                availabilityId: a.id,
                startTime: a.startTime,
                endTime: a.endTime,
              });
            });
          } catch (err) {
            console.error(`Error fetching availability for ${dateStr}:`, err);
          }
        }
        
        setAssignments(assignedList);
      } catch (err) {
        console.error("Error fetching assigned availabilities:", err);
      } finally {
        setLoadingAssignments(false);
      }
    };

    fetchAssignedAvailabilities();
  }, [weekStart, days, loading]);

  function openAddStaff(date: string) {
    setActiveDate(date);
    setSelectedEmployeeId(null);
    setOpen(true);
  }

  async function addStaffToDay() {
    if (!activeDate || !selectedEmployeeId) return;
    
    try {
      setIsSubmitting(true);
      
      // 获取该日期和员工的 availability
      const response = await apiGet<any>(
        "availability",
        {
          params: {
            date: activeDate,
            employeeId: selectedEmployeeId,
          },
        }
      );
      
      // 处理不同的响应格式
      let availabilities: Availability[] = [];
      if (Array.isArray(response)) {
        availabilities = response;
      } else if (response?.availabilities && Array.isArray(response.availabilities)) {
        availabilities = response.availabilities;
      } else if (response?.data && Array.isArray(response.data)) {
        availabilities = response.data;
      }
      
      // 验证返回的 availability 是否属于选择的员工
      const validAvailabilities = availabilities.filter(
        (a: Availability) => a.employeeId === selectedEmployeeId && a.status === "OPEN"
      );
      
      if (validAvailabilities.length === 0) {
        alert("No available time slot found for this employee on this date. Please ensure the employee has created an availability with OPEN status.");
        return;
      }
      
      // 使用 API 返回的顺序，选择第一个有效的 OPEN availability
      const openAvailability = validAvailabilities[0];
      
      // 调用 PUT /availability/assign/{id} 来将状态改为 ASSIGNED
      await apiPut(`availability/assign/${openAvailability.id}`);
      
      // 刷新 assignments
      const assignedList: Assignment[] = [];
      for (const day of days) {
        const dateStr = toISODate(day);
        try {
          const dayResponse = await apiGet<any>(
            "availability",
            {
              params: { date: dateStr },
            }
          );
          
          let dayAvailabilities: Availability[] = [];
          if (Array.isArray(dayResponse)) {
            dayAvailabilities = dayResponse;
          } else if (dayResponse?.availabilities && Array.isArray(dayResponse.availabilities)) {
            dayAvailabilities = dayResponse.availabilities;
          } else if (dayResponse?.data && Array.isArray(dayResponse.data)) {
            dayAvailabilities = dayResponse.data;
          }
          
          const assigned = dayAvailabilities.filter((a: Availability) => a.status === "ASSIGNED");
          assigned.forEach((a: Availability) => {
            assignedList.push({
              date: dateStr,
              employeeId: a.employeeId,
              availabilityId: a.id,
              startTime: a.startTime,
              endTime: a.endTime,
            });
          });
        } catch (err) {
          console.error(`Error fetching availability for ${dateStr}:`, err);
        }
      }
      
      setAssignments(assignedList);
      setOpen(false);
    } catch (error) {
      console.error("Error assigning staff:", error);
      alert(error instanceof Error ? error.message : "Failed to assign staff");
    } finally {
      setIsSubmitting(false);
    }
  }

  function removeAssignment(date: string, employeeId: string) {
    // 暂时只从本地状态移除，如果需要从 API 取消分配，可以在这里调用 API
    setAssignments((prev) => prev.filter((a) => !(a.date === date && a.employeeId === employeeId)));
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardBody className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardBody className="py-12">
          <div className="text-center text-danger">
            <p className="text-lg font-semibold">Error loading employees</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      {/* 如果是只读模式且提供了员工ID，显示可用性表单 */}
      {readOnly && employeeId && (
        <div className="mb-6">
          <EmployeeAvailabilityForm 
            employeeId={employeeId}
            onSuccess={() => {
              // 可以在这里刷新排班数据
              console.log("Availability submitted successfully");
            }}
          />
        </div>
      )}

      <Card className="w-full">
        <CardHeader className="px-3 sm:px-6">
          <div className="flex w-full flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold">Staff Schedule</h3>
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              <Button 
                size="sm" 
                variant="flat" 
                onPress={() => setWeekStart(addDays(weekStart, -7))}
                className="min-w-[40px]"
              >
                ←
              </Button>
              <span className="text-sm sm:text-base md:text-lg font-semibold text-center flex-1 sm:flex-none sm:min-w-[180px] px-2">
                {fmtWeekRange(days)}
              </span>
              <Button 
                size="sm" 
                variant="flat" 
                onPress={() => setWeekStart(addDays(weekStart, 7))}
                className="min-w-[40px]"
              >
                →
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardBody className="px-3 sm:px-6">
          {/* 移动端：垂直滚动单列，桌面端：7列网格 */}
          <div className="flex flex-col gap-3 md:grid md:grid-cols-7 md:gap-2">
            {days.map((d) => {
              const dateStr = toISODate(d);
              const weekday = d.toLocaleDateString(LOCALE, {weekday: "short"});
              const dayNum = d.toLocaleDateString(LOCALE, {day: "numeric"});
              const isTodayDate = isToday(d);

              const dayAssignments = assignments.filter((a) => a.date === dateStr);

              return (
                <Card
                  key={dateStr}
                  radius="lg"
                  shadow="sm"
                  className={`border w-full sm:w-auto min-w-0 ${
                    isTodayDate
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md"
                      : "border-default-200 bg-content1"
                  }`}
                >
                  <CardBody className="p-3 sm:p-3">
                    {/* Day header */}
                    <div className="mb-3 text-center">
                      <div className="text-xs sm:text-sm font-semibold text-foreground-600">{weekday}</div>
                      <div className="text-lg sm:text-xl font-semibold">{dayNum}</div>
                      <div className="text-xs text-foreground-500">
                        {dayAssignments.length} staff
                      </div>
                    </div>

                    {/* Slots list */}
                    <div className="flex flex-col gap-2">
                      {dayAssignments.map((a, idx) => {
                        const emp = employeesById.get(a.employeeId);
                        const fullUser = usersById.get(a.employeeId);
                        return (
                          <Card
                            key={`${a.employeeId}-${idx}`}
                            radius="lg"
                            shadow="none"
                            className="border border-default-200 bg-default-50"
                          >
                            <CardBody className="p-2 sm:p-3">
                              <div className="flex flex-col items-center text-center gap-2">
                                {/* 员工名称 */}
                                <div className="text-xs sm:text-sm font-semibold truncate w-full">
                                  {emp?.name ?? fullUser?.username ?? fullUser?.email ?? a.employeeId}
                                </div>
                                
                                {/* 角色标签 */}
                                {emp?.role && (
                                  <div className="flex justify-center">
                                    <Chip size="sm" variant="flat" color="primary" className="text-xs">
                                      {emp.role}
                                    </Chip>
                                  </div>
                                )}
                                
                                {/* Availability 时间段 */}
                                {a.startTime && a.endTime && (
                                  <div className="text-xs text-foreground-600 font-medium w-full break-words">
                                    <span className="inline-block">🕐</span>{" "}
                                    <span className="whitespace-nowrap">{formatTimeRange(a.startTime, a.endTime)}</span>
                                  </div>
                                )}

                                {/* 移除按钮 */}
                                {!readOnly && (
                                  <Button
                                    size="sm"
                                    variant="light"
                                    color="danger"
                                    onPress={() => removeAssignment(dateStr, a.employeeId)}
                                    className="w-full text-xs sm:text-sm mt-1"
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                            </CardBody>
                          </Card>
                        );
                      })}

                      {/* Add staff area - 只在非只读模式下显示 */}
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => openAddStaff(dateStr)}
                          className="mt-1 w-full rounded-xl border border-dashed border-default-300 bg-default-50/40 px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm text-foreground-600 hover:bg-default-100 active:bg-default-200 transition-colors touch-manipulation"
                        >
                          + Add staff
                        </button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Add staff modal */}
      <Modal 
        isOpen={open} 
        onOpenChange={setOpen}
        size="lg"
        scrollBehavior="inside"
        classNames={{
          base: "max-w-[95vw] sm:max-w-md",
          body: "py-4 sm:py-6",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-lg sm:text-xl">Add staff</ModalHeader>
              <ModalBody>
                <Autocomplete
                  label="Employee"
                  placeholder="Search employee"
                  selectedKey={selectedEmployeeId ?? undefined}
                  onSelectionChange={(key) => setSelectedEmployeeId(String(key))}
                  size="md"
                  classNames={{
                    base: "w-full",
                  }}
                >
                  {employees.map((e) => (
                    <AutocompleteItem key={e.id} textValue={e.name}>
                      {e.name}
                    </AutocompleteItem>
                  ))}
                </Autocomplete>
                {employees.length === 0 && (
                  <p className="text-sm text-foreground-500 mt-2">No employees available</p>
                )}
              </ModalBody>
              <ModalFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                <Button 
                  variant="light" 
                  onPress={onClose}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  onPress={addStaffToDay} 
                  isDisabled={!selectedEmployeeId || isSubmitting}
                  isLoading={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Add
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
