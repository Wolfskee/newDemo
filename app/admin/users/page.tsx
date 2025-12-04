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
} from "@nextui-org/react";

interface User {
  id: string;
  email: string;
  role: "user" | "admin" | "employee";
  createdAt: string;
  lastLogin?: string;
  bookingsCount?: number;
}

export default function ManageUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
      const response = await fetch("/api/users");
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const response = await fetch(`/api/users?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        await fetchUsers();
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
              Manage Users
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View and manage all registered users
            </p>
          </div>
          <Button
            color="default"
            variant="flat"
            onPress={() => router.push("/admin/dashboard")}
          >
            ← Back to Dashboard
          </Button>
        </div>

        <Card className="mb-6">
          <CardBody>
            <Input
              placeholder="Search users by email..."
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
                Users ({filteredUsers.length})
              </h2>
            </div>
          </CardHeader>
          <CardBody>
            <Table aria-label="Users table">
              <TableHeader>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>BOOKINGS</TableColumn>
                <TableColumn>CREATED AT</TableColumn>
                <TableColumn>LAST LOGIN</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <button
                          onClick={() => router.push(`/admin/users/${encodeURIComponent(user.email)}`)}
                          className="font-semibold text-primary hover:underline cursor-pointer"
                        >
                          {user.email}
                        </button>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={
                            user.role === "admin"
                              ? "danger"
                              : user.role === "employee"
                              ? "warning"
                              : "primary"
                          }
                          size="sm"
                          variant="flat"
                        >
                          {user.role.toUpperCase()}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {user.bookingsCount || 0}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        {user.lastLogin
                          ? formatDate(user.lastLogin)
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          onPress={() => handleDelete(user.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-gray-500">
                        {searchTerm
                          ? "No users found matching your search"
                          : "No users found"}
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
