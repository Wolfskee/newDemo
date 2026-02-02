"use client";

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
import EmployeeAvailabilityForm from "./EmployeeAvailabilityForm";
import { useDayStaffSchedule } from "../hooks/useDayStaffSchedule";
import { addDays } from "date-fns"; // Or reuse the helper if not using date-fns yet, but I'll define local helper or import if available. Actually the hook has it. I need to format dates for display.

const LOCALE = "en-US";

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
  const start = days[0].toLocaleDateString(LOCALE, { month: "long", day: "numeric" });
  const end = days[6].toLocaleDateString(LOCALE, { month: "long", day: "numeric" });
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
  const {
    weekStart,
    setWeekStart,
    days,
    assignments,
    loading,
    error,
    employeesById,
    usersById,
    openAddStaffModal,
    setOpenAddStaffModal,
    availableEmployees,
    loadingAvailableEmployees,
    isSubmitting,
    selectedEmployeeId,
    setSelectedEmployeeId,
    setActiveDate,
    handleRemoveAssignment,
    handleAddStaffToDay
  } = useDayStaffSchedule();

  function openAddStaff(date: string) {
    setActiveDate(date);
    setSelectedEmployeeId(null);
    setOpenAddStaffModal(true);
  }

  // Need to redefine addDays locally for UI buttons if not exported from hook, 
  // currently hook returns `days` array but `setWeekStart` needs a date.
  // I will add a local helper or use the one from hook if I exported it? No I didn't export `addDays`. 
  // I will add local helper.
  function addDaysLocal(d: Date, n: number) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
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
                onPress={() => setWeekStart(addDaysLocal(weekStart, -7))}
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
                onPress={() => setWeekStart(addDaysLocal(weekStart, 7))}
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
              const weekday = d.toLocaleDateString(LOCALE, { weekday: "short" });
              const dayNum = d.toLocaleDateString(LOCALE, { day: "numeric" });
              const isTodayDate = isToday(d);

              const dayAssignments = assignments.filter((a) => a.date === dateStr);

              return (
                <Card
                  key={dateStr}
                  radius="lg"
                  shadow="sm"
                  className={`border w-full sm:w-auto min-w-0 ${isTodayDate
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
                                    onPress={() => handleRemoveAssignment(dateStr, a.employeeId)}
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
        isOpen={openAddStaffModal}
        onOpenChange={setOpenAddStaffModal}
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
                  isLoading={loadingAvailableEmployees}
                >
                  {availableEmployees.map((e) => (
                    <AutocompleteItem key={e.id} textValue={e.name}>
                      {e.name}
                    </AutocompleteItem>
                  ))}
                </Autocomplete>
                {!loadingAvailableEmployees && availableEmployees.length === 0 && (
                  <p className="text-sm text-foreground-500 mt-2">No employees available for this date</p>
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
                  onPress={handleAddStaffToDay}
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
