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
import { apiGet } from "@/lib/api-client";
import { User, UserListResponse } from "@/types/api";

type Employee = { id: string; name: string; role?: string };
type Assignment = { employeeId: string; date: string }; // date: YYYY-MM-DD

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
function fmtWeekRange(days: Date[]) {
  const start = days[0].toLocaleDateString(LOCALE, {month: "long", day: "numeric"});
  const end = days[6].toLocaleDateString(LOCALE, {month: "long", day: "numeric"});
  return `${start} — ${end}`;
}

export default function DayStaffSchedule() {
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          role: user.role === "EMPLOYEE" || user.role === "employee" ? "Employee" : undefined,
        }));
        setEmployees(formattedEmployees);
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

  function openAddStaff(date: string) {
    setActiveDate(date);
    setSelectedEmployeeId(null);
    setOpen(true);
  }

  function addStaffToDay() {
    if (!activeDate || !selectedEmployeeId) return;
    setAssignments((prev) => [...prev, {date: activeDate, employeeId: selectedEmployeeId}]);
    setOpen(false);
  }

  function removeAssignment(date: string, employeeId: string) {
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
      <Card className="w-full">
        <CardHeader>
          <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl sm:text-2xl font-semibold">Staff Schedule</h3>
            <div className="flex items-center justify-center sm:justify-end gap-2">
              <Button size="sm" variant="flat" onPress={() => setWeekStart(addDays(weekStart, -7))}>
                ←
              </Button>
              <span className="text-base sm:text-lg font-semibold min-w-[180px] text-center">
                {fmtWeekRange(days)}
              </span>
              <Button size="sm" variant="flat" onPress={() => setWeekStart(addDays(weekStart, 7))}>
                →
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          <div className="grid grid-cols-7 gap-2">
            {days.map((d) => {
              const dateStr = toISODate(d);
              const weekday = d.toLocaleDateString(LOCALE, {weekday: "short"});
              const dayNum = d.toLocaleDateString(LOCALE, {day: "numeric"});

              const dayAssignments = assignments.filter((a) => a.date === dateStr);

              return (
                <Card
                  key={dateStr}
                  radius="lg"
                  shadow="sm"
                  className="border border-default-200 bg-content1"
                >
                  <CardBody className="p-3">
                    {/* Day header */}
                    <div className="mb-3 text-center">
                      <div className="text-sm font-semibold text-foreground-600">{weekday}</div>
                      <div className="text-xl font-semibold">{dayNum}</div>
                      <div className="text-xs text-foreground-500">
                        {dayAssignments.length} staff
                      </div>
                    </div>

                    {/* Slots list */}
                    <div className="flex flex-col gap-2">
                      {dayAssignments.map((a, idx) => {
                        const emp = employeesById.get(a.employeeId);
                        return (
                          <Card
                            key={`${a.employeeId}-${idx}`}
                            radius="lg"
                            shadow="none"
                            className="border border-default-200 bg-default-50"
                          >
                            <CardBody className="p-3 flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <div className="text-sm font-semibold truncate">
                                  {emp?.name ?? a.employeeId}
                                </div>
                                {emp?.role ? (
                                  <div className="mt-1">
                                    <Chip size="sm" variant="flat" color="primary">
                                      {emp.role}
                                    </Chip>
                                  </div>
                                ) : null}
                              </div>

                              <Button
                                size="sm"
                                variant="light"
                                onPress={() => removeAssignment(dateStr, a.employeeId)}
                              >
                                Remove
                              </Button>
                            </CardBody>
                          </Card>
                        );
                      })}

                      {/* Add staff area */}
                      <button
                        type="button"
                        onClick={() => openAddStaff(dateStr)}
                        className="mt-1 w-full rounded-xl border border-dashed border-default-300 bg-default-50/40 px-3 py-3 text-sm text-foreground-600 hover:bg-default-100 transition-colors"
                      >
                        + Add staff
                      </button>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Add staff modal */}
      <Modal isOpen={open} onOpenChange={setOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add staff</ModalHeader>
              <ModalBody>
                <Autocomplete
                  label="Employee"
                  placeholder="Search employee"
                  selectedKey={selectedEmployeeId ?? undefined}
                  onSelectionChange={(key) => setSelectedEmployeeId(String(key))}
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
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={addStaffToDay} isDisabled={!selectedEmployeeId}>
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
