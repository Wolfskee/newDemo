"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, useDisclosure } from "@heroui/react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";
import { User, UserListResponse } from "@/types/api";
import SearchCard from "./components/SearchCard";
import EmployeesTableCard from "./components/EmployeesTableCard";
import QuickActionsCard from "./components/QuickActionsCard";
import { getEmployeeCredentialsEmail } from "@/lib/email-templates";

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
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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
      const data: UserListResponse = await apiGet<UserListResponse>("user");
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
        confirmPassword: "",
        phone: employee.phone || "",
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
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

    // 验证密码和确认密码是否一致
    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        alert("Password and confirm password do not match");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (editingEmployee) {
        // 编辑现有员工 - 使用 PUT /user/{id}
        const body = {
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          role: "EMPLOYEE",
          ...(formData.password && { password: formData.password }),
        };

        await apiPut(`user/${editingEmployee.id}`, body);
        await fetchEmployees();
        onOpenChange();
        setFormData({ username: "", email: "", password: "", confirmPassword: "", phone: "" });
        setEditingEmployee(null);
      } else {
        // 创建新员工 - 使用 POST /auth/register (需要 skipAuth: true)
        await apiPost(
          "auth/register",
          {
            username: formData.username.trim(),
            email: formData.email.trim(),
            password: formData.password,
            role: "EMPLOYEE",
            phone: formData.phone.trim(),
          },
          { skipAuth: true }
        );

        // 发送员工凭证邮件
        try {
          const emailData = getEmployeeCredentialsEmail({
            email: formData.email.trim(),
            username: formData.username.trim(),
            password: formData.password,
          });

          await apiPost(
            "api/send-email",
            {
              to: formData.email.trim(),
              subject: emailData.subject,
              html: emailData.html,
            },
            { skipAuth: true }
          );
        } catch (emailError) {
          console.error("Error sending employee credentials email:", emailError);
          // 即使邮件发送失败，也继续执行
        }
        
        await fetchEmployees();
        onOpenChange();
        setFormData({ username: "", email: "", password: "", confirmPassword: "", phone: "" });
        alert("Employee created successfully! Credentials have been sent to their email.");
      }
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
      await apiDelete(`user/${id}`);
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

  if (!adminUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* 左侧导航栏 */}
      <QuickActionsCard 
        adminUser={adminUser} 
        isExpanded={isNavExpanded}
        onToggle={() => setIsNavExpanded(!isNavExpanded)}
      />
      
      {/* 主内容区 */}
      <main 
        className={`
          flex-1 transition-all duration-300 ease-in-out
          lg:${isNavExpanded ? 'ml-64' : 'ml-20'}
        `}
      >
        <div className="py-4 md:py-8 px-3 sm:px-4">
          <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Manage Employees
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 md:mt-2">
              Add, edit, or remove employees
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              color="default"
              variant="flat"
              onPress={() => router.push("/admin/dashboard")}
              size="sm"
              className="w-full sm:w-auto"
            >
              ← Back
            </Button>
            <Button 
              color="warning" 
              onPress={() => handleOpenModal()}
              size="sm"
              className="w-full sm:w-auto"
            >
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
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange} 
          size="2xl" 
          scrollBehavior="inside"
          classNames={{
            base: "max-w-[95vw] sm:max-w-2xl",
            body: "py-4 sm:py-6",
          }}
        >
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
                    {formData.password && (
                      <Input
                        label="Confirm Password"
                        type="password"
                        placeholder="Enter password again"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                        isRequired={!!formData.password}
                        fullWidth
                        errorMessage={
                          formData.confirmPassword && formData.password !== formData.confirmPassword
                            ? "Passwords do not match"
                            : undefined
                        }
                      />
                    )}
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
                <ModalFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                  <Button 
                    variant="light" 
                    onPress={onClose}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    color="warning"
                    onPress={handleSubmit}
                    isLoading={isSubmitting}
                    className="w-full sm:w-auto"
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
      </main>
    </div>
  );
}
