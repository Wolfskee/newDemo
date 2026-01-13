"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spinner,
  Select,
  SelectItem,
  DatePicker,
  Input,
} from "@heroui/react";
import { parseDate, CalendarDate } from "@internationalized/date";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";
import { User, UserListResponse, Availability, AvailabilityListResponse } from "@/types/api";

interface ManageEmployeeAvailabilityProps {
  onSuccess?: () => void;
}

export default function ManageEmployeeAvailability({ onSuccess }: ManageEmployeeAvailabilityProps) {
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAvailabilities, setLoadingAvailabilities] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  
  // 查询日期（用于获取 availability）
  const [queryDate, setQueryDate] = useState<CalendarDate | null>(() => {
    const today = new Date();
    return parseDate(today.toISOString().split("T")[0]);
  });
  
  // 表单状态（用于添加）
  const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(null);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  const [status, setStatus] = useState<string>("OPEN");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取员工列表
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data: UserListResponse = await apiGet<UserListResponse>("user");
        const employeeList = (data.users || []).filter(
          (user: User) => user.role === "EMPLOYEE" || user.role === "employee"
        );
        setEmployees(employeeList);
        // 初始值保持为 null，表示 "All Employees"
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // 当选择员工或查询日期改变时，获取 availability
  useEffect(() => {
    if (queryDate) {
      fetchEmployeeAvailability(selectedEmployee?.id);
    }
  }, [selectedEmployee, queryDate]);

  const fetchEmployeeAvailability = async (employeeId?: string) => {
    if (!queryDate) return;
    
    try {
      setLoadingAvailabilities(true);
      // 格式化日期为 YYYY-MM-DD
      const dateString = `${queryDate.year}-${String(queryDate.month).padStart(2, "0")}-${String(queryDate.day).padStart(2, "0")}`;
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/16994803-dd8c-4919-8923-e3af2b987796',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ManageEmployeeAvailability.tsx:95',message:'fetchEmployeeAvailability started',data:{date:dateString,employeeId:employeeId || 'all'},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // API 需要 date 参数（必需），可选 employeeId 参数
      const params: Record<string, string> = {
        date: dateString,
      };
      
      // 如果选择了员工，添加 employeeId 参数
      if (employeeId) {
        params.employeeId = employeeId;
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/16994803-dd8c-4919-8923-e3af2b987796',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ManageEmployeeAvailability.tsx:108',message:'Calling API with params',data:{params:params},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      // API 直接返回数组格式 [{...}], 不是 {availabilities: [...]}
      const response = await apiGet<any>(
        `availability`,
        {
          params: params,
        }
      );
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/16994803-dd8c-4919-8923-e3af2b987796',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ManageEmployeeAvailability.tsx:120',message:'Raw API response received',data:{responseType:Array.isArray(response) ? 'array' : typeof response,responseLength:Array.isArray(response) ? response.length : (response?.availabilities?.length || response?.data?.length || 0),responsePreview:JSON.stringify(response).substring(0, 500)},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      // 处理不同的响应格式
      let availabilities: Availability[] = [];
      if (Array.isArray(response)) {
        // API 直接返回数组
        availabilities = response;
      } else if (response?.availabilities && Array.isArray(response.availabilities)) {
        // API 返回对象，包含 availabilities 数组
        availabilities = response.availabilities;
      } else if (response?.data && Array.isArray(response.data)) {
        // API 返回对象，包含 data 数组
        availabilities = response.data;
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/16994803-dd8c-4919-8923-e3af2b987796',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ManageEmployeeAvailability.tsx:135',message:'Processed availability data',data:{availabilitiesCount:availabilities.length,availabilities:availabilities},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      setAvailabilities(availabilities);
    } catch (error) {
      console.error("Error fetching availability:", error);
      setAvailabilities([]);
    } finally {
      setLoadingAvailabilities(false);
    }
  };

  const handleOpenModal = () => {
    // 重置表单为默认值
    setSelectedDate(null);
    setStartTime("09:00");
    setEndTime("17:00");
    setStatus("OPEN");
    onOpen();
  };

  const combineDateTime = (date: string, time: string): string => {
    const [hours, minutes] = time.split(":");
    const [year, month, day] = date.split("-").map(Number);
    const dateTime = new Date(Date.UTC(year, month - 1, day, parseInt(hours), parseInt(minutes), 0));
    return dateTime.toISOString();
  };

  const handleSubmit = async () => {
    if (!selectedEmployee || !selectedDate) {
      alert("Please select an employee and date");
      return;
    }

    if (!startTime || !endTime) {
      alert("Please enter both start and end time");
      return;
    }

    if (startTime >= endTime) {
      alert("End time must be after start time");
      return;
    }

    setIsSubmitting(true);
    try {
      const dateString = `${selectedDate.year}-${String(selectedDate.month).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}`;
      
      const availabilityData = {
        date: combineDateTime(dateString, "00:00"),
        startTime: combineDateTime(dateString, startTime),
        endTime: combineDateTime(dateString, endTime),
        status: status,
        employeeId: selectedEmployee.id,
      };

      // 创建新的 availability
      await apiPost("availability", availabilityData);

      // 刷新数据
      await fetchEmployeeAvailability(selectedEmployee.id);
      onOpenChange();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      alert(error instanceof Error ? error.message : "Failed to save availability");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this availability?")) {
      return;
    }

    try {
      await apiDelete(`availability/${id}`);
      // 删除后刷新数据（无论是否选择了员工）
      await fetchEmployeeAvailability(selectedEmployee?.id);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error deleting availability:", error);
      alert(error instanceof Error ? error.message : "Failed to delete availability");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // 使用 UTC 方法来避免时区转换问题
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC", // 明确使用 UTC 时区
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    // 使用 UTC 方法来避免时区转换问题，使用24小时制
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
            <div>
              <h3 className="text-xl font-semibold">Manage Employee Availability</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                View and manage availability for all employees
              </p>
            </div>
            {selectedEmployee && (
              <Button
                color="primary"
                onPress={() => handleOpenModal()}
                size="sm"
              >
                + Add Availability
              </Button>
            )}
          </div>
        </CardHeader>
        <CardBody>
          {employees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No employees found
            </div>
          ) : (
            <div className="space-y-4">
              {/* 日期选择 */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Date *</label>
                <DatePicker
                  label="Query Date"
                  value={queryDate}
                  onChange={(date) => setQueryDate(date)}
                  minValue={parseDate(new Date().toISOString().split("T")[0])}
                  fullWidth
                  isRequired
                />
              </div>

              {/* 员工选择 */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Employee (Optional)</label>
                <Select
                  selectedKeys={selectedEmployee ? [selectedEmployee.id] : ["all"]}
                  onSelectionChange={(keys) => {
                    const selectedId = Array.from(keys)[0] as string;
                    if (selectedId === "all") {
                      setSelectedEmployee(null);
                    } else {
                      const employee = employees.find((e) => e.id === selectedId);
                      setSelectedEmployee(employee || null);
                    }
                  }}
                  fullWidth
                  description="Select 'All Employees' to view all, or select a specific employee"
                >
                  {[
                    <SelectItem key="all" textValue="All Employees">
                      All Employees
                    </SelectItem>,
                    ...employees.map((employee) => (
                      <SelectItem key={employee.id} textValue={employee.username || employee.email}>
                        {employee.username || employee.email}
                      </SelectItem>
                    ))
                  ]}
                </Select>
              </div>

              {/* Availability 列表 */}
              {queryDate && (
                <div>
                  <h4 className="text-lg font-semibold mb-4">
                    Availability for {selectedEmployee ? (selectedEmployee.username || selectedEmployee.email) : "All Employees"} on {queryDate.year}-{String(queryDate.month).padStart(2, "0")}-{String(queryDate.day).padStart(2, "0")}
                  </h4>
                  {loadingAvailabilities ? (
                    <div className="flex justify-center py-8">
                      <Spinner />
                    </div>
                  ) : availabilities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No availability records found for {queryDate.year}-{String(queryDate.month).padStart(2, "0")}-{String(queryDate.day).padStart(2, "0")}
                      {selectedEmployee && ` and employee ${selectedEmployee.username || selectedEmployee.email}`}
                    </div>
                  ) : (
                    <>
                      {/* #region agent log */}
                      {(() => {
                        fetch('http://127.0.0.1:7242/ingest/16994803-dd8c-4919-8923-e3af2b987796',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ManageEmployeeAvailability.tsx:376',message:'Rendering availability table',data:{availabilitiesCount:availabilities.length,availabilities:availabilities},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'D'})}).catch(()=>{});
                        return null;
                      })()}
                      {/* #endregion */}
                      <Table aria-label="Availability table">
                        <TableHeader>
                          <TableColumn>EMPLOYEE</TableColumn>
                          <TableColumn>DATE</TableColumn>
                          <TableColumn>START TIME</TableColumn>
                          <TableColumn>END TIME</TableColumn>
                          <TableColumn>STATUS</TableColumn>
                          <TableColumn>ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody>
                          {availabilities.map((availability) => {
                            const employee = employees.find((e) => e.id === availability.employeeId);
                            return (
                              <TableRow key={availability.id}>
                                <TableCell>
                                  {employee ? (employee.username || employee.email) : availability.employeeId}
                                </TableCell>
                                <TableCell>{formatDate(availability.date)}</TableCell>
                                <TableCell>{formatTime(availability.startTime)}</TableCell>
                                <TableCell>{formatTime(availability.endTime)}</TableCell>
                                <TableCell>
                                  <Chip
                                    size="sm"
                                    variant="flat"
                                    color={availability.status === "OPEN" ? "success" : "default"}
                                  >
                                    {availability.status}
                                  </Chip>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    color="danger"
                                    onPress={() => handleDelete(availability.id)}
                                  >
                                    Delete
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* 添加 Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                Add Availability
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <DatePicker
                    label="Date"
                    value={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    minValue={parseDate(new Date().toISOString().split("T")[0])}
                    fullWidth
                    isRequired
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="time"
                      label="Start Time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      fullWidth
                      isRequired
                    />
                    <Input
                      type="time"
                      label="End Time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      fullWidth
                      isRequired
                    />
                  </div>

                  <Select
                    label="Status"
                    selectedKeys={[status]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setStatus(selected);
                    }}
                    fullWidth
                    isRequired
                  >
                    <SelectItem key="OPEN">OPEN</SelectItem>
                    <SelectItem key="CLOSED">CLOSED</SelectItem>
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleSubmit}
                  isLoading={isSubmitting}
                >
                  Create
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
