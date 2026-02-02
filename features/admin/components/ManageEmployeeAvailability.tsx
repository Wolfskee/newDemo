"use client";

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
import { useManageEmployeeAvailability } from "../hooks/useManageEmployeeAvailability";

export default function ManageEmployeeAvailability() {
  const {
    employees,
    selectedEmployee,
    setSelectedEmployee,
    editingAvailability,
    availabilities,
    loading,
    loadingAvailabilities,
    queryDate,
    setQueryDate,
    selectedDate,
    setSelectedDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    status,
    setStatus,
    isSubmitting,
    isOpen,
    onOpenChange,
    handleOpenModal,
    handleSubmit,
    handleDelete
  } = useManageEmployeeAvailability();

  // Helper functions for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const onSubmit = () => {
    handleSubmit();
  };

  const onDelete = (id: string) => {
    handleDelete(id);
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
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="flat"
                                      color="primary"
                                      onPress={() => handleOpenModal(availability)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="flat"
                                      color="danger"
                                      onPress={() => onDelete(availability.id)}
                                    >
                                      Delete
                                    </Button>
                                  </div>
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
                {editingAvailability ? "Edit Availability" : "Add Availability"}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <DatePicker
                    label="Date"
                    value={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
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
                  onPress={onSubmit}
                  isLoading={isSubmitting}
                >
                  {editingAvailability ? "Save Changes" : "Create"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
