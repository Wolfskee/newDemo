"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";

interface Employee {
  id: string;
  email: string;
  role: "user" | "admin" | "employee";
  createdAt: string;
  lastLogin?: string;
  bookingsCount?: number;
}

export default function ManageEmployeesPage() {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check for admin session
    const stored = localStorage.getItem("adminUser");
    if (!stored) {
      router.push("/admin");
    } else {
      fetchEmployees();
    }
  }, [router]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (data.success) {
        // Filter only employees
        const employeeList = (data.users || []).filter(
          (user: Employee) => user.role === "employee"
        );
        setEmployees(employeeList);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setLoading(false);
    }
  };

  const handleOpenModal = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({ email: employee.email });
    } else {
      setEditingEmployee(null);
      setFormData({ email: "" });
    }
    onOpen();
  };

  const handleSubmit = async () => {
    if (!formData.email) {
      alert("Please enter an email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = "/api/users";
      const method = editingEmployee ? "PUT" : "POST";
      const body = editingEmployee
        ? { id: editingEmployee.id, email: formData.email, role: "employee" }
        : { email: formData.email, role: "employee" };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        await fetchEmployees();
        onOpenChange();
        setFormData({ email: "" });
        setEditingEmployee(null);
      } else {
        alert(data.error || "Failed to save employee");
      }
    } catch (error) {
      console.error("Error saving employee:", error);
      alert("Failed to save employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      const response = await fetch(`/api/users?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        await fetchEmployees();
      } else {
        alert(data.error || "Failed to delete employee");
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Failed to delete employee");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredEmployees = employees.filter((employee) =>
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Manage Employees
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Add, edit, or remove employees
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              color="default"
              variant="flat"
              onPress={() => router.push("/admin/dashboard")}
            >
              ← Back to Dashboard
            </Button>
            <Button color="warning" onPress={() => handleOpenModal()}>
              + Add Employee
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardBody>
            <Input
              placeholder="Search employees by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<span className="text-gray-400">🔍</span>}
              fullWidth
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <h2 className="text-2xl font-semibold">
                Employees ({filteredEmployees.length})
              </h2>
            </div>
          </CardHeader>
          <CardBody>
            <Table aria-label="Employees table">
              <TableHeader>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>BOOKINGS</TableColumn>
                <TableColumn>CREATED AT</TableColumn>
                <TableColumn>LAST LOGIN</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <button
                          onClick={() =>
                            router.push(
                              `/admin/employees/${encodeURIComponent(employee.email)}`
                            )
                          }
                          className="font-semibold text-primary hover:underline cursor-pointer"
                        >
                          {employee.email}
                        </button>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat" color="warning">
                          EMPLOYEE
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {employee.bookingsCount || 0}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(employee.createdAt)}</TableCell>
                      <TableCell>
                        {employee.lastLogin
                          ? formatDate(employee.lastLogin)
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            onPress={() => handleOpenModal(employee)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() => handleDelete(employee.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-gray-500">
                        {searchTerm
                          ? "No employees found matching your search"
                          : "No employees found"}
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* Add/Edit Employee Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  {editingEmployee ? "Edit Employee" : "Add New Employee"}
                </ModalHeader>
                <ModalBody>
                  <Input
                    label="Email"
                    type="email"
                    placeholder="Enter employee email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    isRequired
                    fullWidth
                  />
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="warning"
                    onPress={handleSubmit}
                    isLoading={isSubmitting}
                  >
                    {editingEmployee ? "Update" : "Create"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
