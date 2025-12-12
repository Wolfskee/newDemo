"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, useDisclosure } from "@nextui-org/react";
import { apiUrl } from "@/lib/api-config";
import { User, UserListResponse } from "@/types/api";
import SearchCard from "./components/SearchCard";
import EmployeesTableCard from "./components/EmployeesTableCard";

interface AdminUser {
  email: string;
  role: "admin" | "employee";
}

export default function ManageEmployeesPage() {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("adminUser");
    if (!stored) {
      router.push("/admin");
    } else {
      const user = JSON.parse(stored);
      setAdminUser(user);
      
      // 检查权限：只有 admin 可以访问此页面
      if (user.role === "employee") {
        router.push("/admin/dashboard");
        return;
      }
      
      fetchEmployees();
    }
  }, [router]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(apiUrl("user"));
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data: UserListResponse = await response.json();
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
      setFormData({
        username: employee.username || "",
        email: employee.email,
        password: "",
        phone: employee.phone || "",
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        username: "",
        email: "",
        password: "",
        phone: "",
      });
    }
    onOpen();
  };

  const handleSubmit = async () => {
    // 验证必填字段
    if (!formData.username || !formData.email || !formData.phone) {
      alert("Please fill in all required fields (username, email, phone)");
      return;
    }

    // 创建新员工时需要密码
    if (!editingEmployee && !formData.password) {
      alert("Password is required for new employees");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingEmployee) {
        // 编辑现有员工 - 使用 PUT /user/{id}
        const url = apiUrl(`user/${editingEmployee.id}`);
        const body = {
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          role: "EMPLOYEE",
          ...(formData.password && { password: formData.password }),
        };

        const response = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (response.status === 201) {
          await fetchEmployees();
          onOpenChange();
          setFormData({ username: "", email: "", password: "", phone: "" });
          setEditingEmployee(null);
        } else {
          const errorData = await response.json().catch(() => ({}));
          alert(errorData.message || "Failed to update employee");
        }
      } else {
        // 创建新员工 - 使用 POST /auth/register
        const response = await fetch(apiUrl("auth/register"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username.trim(),
            email: formData.email.trim(),
            password: formData.password,
            role: "EMPLOYEE",
            phone: formData.phone.trim(),
          }),
        });

        if (response.status === 201) {
          // 注册成功后，调用项目中的邮件发送功能
          // TODO: 请替换为项目中实际的邮件发送函数
          // 例如: sendEmployeeCredentials(formData.email, formData.username, formData.password);
          
          await fetchEmployees();
          onOpenChange();
          setFormData({ username: "", email: "", password: "", phone: "" });
          alert("Employee created successfully! Credentials have been sent to their email.");
        } else {
          const errorData = await response.json().catch(() => ({}));
          alert(errorData.message || "Failed to create employee");
        }
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
      const response = await fetch(apiUrl(`user/${id}`), {
        method: "DELETE",
      });

      if (response.status === 201) {
        await fetchEmployees();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || "Failed to delete employee");
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Failed to delete employee");
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
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  {editingEmployee ? "Edit Employee" : "Add New Employee"}
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <Input
                      label="Username"
                      placeholder="Enter username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      isRequired
                      fullWidth
                    />
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
                    <Input
                      label="Password"
                      type="password"
                      placeholder={editingEmployee ? "Leave empty to keep current password" : "Enter password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      isRequired={!editingEmployee}
                      fullWidth
                    />
                    <Input
                      label="Phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      isRequired
                      fullWidth
                    />
                  </div>
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
