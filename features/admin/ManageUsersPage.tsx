"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Button, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Input, 
  Select, 
  SelectItem,
  useDisclosure 
} from "@heroui/react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";
import { User, UserListResponse } from "@/types/api";
import SearchCard from "./components/SearchCard";
import UsersTableCard from "./components/UsersTableCard";
import { getUserWelcomeEmail } from "@/lib/email-templates";

export default function ManageUsersPage() {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "CUSTOMER",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check for admin session
    const stored = localStorage.getItem("adminUser");
    if (!stored) {
      router.push("/admin");
    } else {
      fetchUsers();
    }
  }, [router]);

  const fetchUsers = async () => {
    try {
      const data: UserListResponse = await apiGet<UserListResponse>("user");
      // 只显示 CUSTOMER 角色的用户
      const customerUsers = (data.users || []).filter(
        (user: User) => user.role === "CUSTOMER" || user.role === "customer"
      );
      setUsers(customerUsers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username || "",
        email: user.email,
        password: "",
        confirmPassword: "",
        phone: user.phone || "",
        role: user.role || "CUSTOMER",
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        role: "CUSTOMER",
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

    // 创建新用户时需要密码
    if (!editingUser && !formData.password) {
      alert("Password is required for new users");
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
      if (editingUser) {
        // 编辑现有用户 - 使用 PUT /user/{id}
        const body = {
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          ...(formData.password && { password: formData.password }),
        };

        await apiPut(`user/${editingUser.id}`, body);
        await fetchUsers();
        onOpenChange();
        setFormData({ username: "", email: "", password: "", confirmPassword: "", phone: "", role: "CUSTOMER" });
        setEditingUser(null);
      } else {
        // 创建新用户 - 使用 POST /auth/register (需要 skipAuth: true)
        await apiPost(
          "auth/register",
          {
            username: formData.username.trim(),
            email: formData.email.trim(),
            password: formData.password,
            role: formData.role,
            phone: formData.phone.trim(),
          },
          { skipAuth: true }
        );

        // 发送欢迎邮件
        try {
          const emailData = getUserWelcomeEmail({
            email: formData.email.trim(),
            username: formData.username.trim(),
            role: formData.role,
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
          console.error("Error sending welcome email:", emailError);
          // 即使邮件发送失败，也继续执行
        }

        await fetchUsers();
        onOpenChange();
        setFormData({ username: "", email: "", password: "", confirmPassword: "", phone: "", role: "CUSTOMER" });
        alert("User created successfully! A welcome email has been sent.");
      }
    } catch (error) {
      console.error("Error saving user:", error);
      alert(error instanceof Error ? error.message : "Failed to save user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await apiDelete(`user/${id}`);
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(error instanceof Error ? error.message : "Failed to delete user");
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Manage Users
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 md:mt-2">
              View and manage all registered users
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
              color="primary" 
              onPress={() => handleOpenModal()}
              size="sm"
              className="w-full sm:w-auto"
            >
              + Add User
            </Button>
          </div>
        </div>

        <SearchCard
          placeholder="Search users by email or username..."
          value={searchTerm}
          onChange={setSearchTerm}
        />

        <UsersTableCard
          users={filteredUsers}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
        />

        {/* Add/Edit User Modal */}
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange} 
          size="2xl" 
          scrollBehavior="inside"
          className="max-w-[95vw]"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  {editingUser ? "Edit User" : "Add New User"}
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
                      placeholder="Enter user email"
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
                      placeholder={editingUser ? "Leave empty to keep current password" : "Enter password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      isRequired={!editingUser}
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
                    <Select
                      label="Role"
                      selectedKeys={[formData.role]}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        setFormData({ ...formData, role: selected });
                      }}
                      isRequired
                      fullWidth
                    >
                      <SelectItem key="CUSTOMER">
                        CUSTOMER
                      </SelectItem>
                      <SelectItem key="ADMIN">
                        ADMIN
                      </SelectItem>
                      <SelectItem key="EMPLOYEE">
                        EMPLOYEE
                      </SelectItem>
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
                    {editingUser ? "Update" : "Create"}
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
