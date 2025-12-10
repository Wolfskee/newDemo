"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, useDisclosure } from "@nextui-org/react";
import { apiUrl } from "@/lib/api-config";
import { User } from "@/types/api";
import SearchCard from "./components/SearchCard";
import EmployeesTableCard from "./components/EmployeesTableCard";

export default function ManageEmployeesPage() {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("adminUser");
    if (!stored) {
      router.push("/admin");
    } else {
      fetchEmployees();
    }
  }, [router]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(apiUrl("api/user"));
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      const employeeList = (data.users || []).filter(
        (user: User) => user.role === "EMPLOYEE" || user.role === "employee"
      );
      setEmployees(employeeList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setLoading(false);
    }
  };

  const handleOpenModal = (employee?: User) => {
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
      const url = editingEmployee ? apiUrl(`api/user/${editingEmployee.id}`) : apiUrl("api/user");
      const method = editingEmployee ? "PUT" : "POST";
      const body = editingEmployee
        ? { ...editingEmployee, email: formData.email, role: "EMPLOYEE" }
        : { email: formData.email, role: "EMPLOYEE" };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save employee");
      }

      await fetchEmployees();
      onOpenChange();
      setFormData({ email: "" });
      setEditingEmployee(null);
    } catch (error) {
      console.error("Error saving employee:", error);
      alert(error instanceof Error ? error.message : "Failed to save employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      const response = await fetch(apiUrl(`api/user/${id}`), {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete employee");
      }

      await fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert(error instanceof Error ? error.message : "Failed to delete employee");
    }
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

        <SearchCard
          placeholder="Search employees by email..."
          value={searchTerm}
          onChange={setSearchTerm}
        />

        <EmployeesTableCard
          employees={filteredEmployees}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
        />

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
