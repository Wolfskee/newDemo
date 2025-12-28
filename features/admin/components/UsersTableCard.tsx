"use client";

import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Button } from "@heroui/react";
import { User } from "@/types/api";
import { useRouter } from "next/navigation";

interface UsersTableCardProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

export default function UsersTableCard({ users, onEdit, onDelete }: UsersTableCardProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleColor = (role: string) => {
    const roleUpper = role.toUpperCase();
    if (roleUpper === "ADMIN") {
      return "danger";
    } else if (roleUpper === "EMPLOYEE") {
      return "warning";
    } else {
      return "primary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl md:text-2xl font-semibold">
            Users ({users.length})
          </h2>
        </div>
      </CardHeader>
      <CardBody>
        {/* 桌面端表格 */}
        <div className="hidden md:block">
          <Table aria-label="Users table">
            <TableHeader>
              <TableColumn>USERNAME</TableColumn>
              <TableColumn>EMAIL</TableColumn>
              <TableColumn>PHONE</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>CREATED AT</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No users found">
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <button
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                      className="font-semibold text-primary hover:underline cursor-pointer"
                    >
                      {user.username}
                    </button>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Chip
                      color={getRoleColor(user.role)}
                      size="sm"
                      variant="flat"
                    >
                      {user.role}
                    </Chip>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => onEdit(user)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => onDelete(user.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 移动端卡片列表 */}
        <div className="md:hidden space-y-4">
          {users.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No users found</p>
          ) : (
            users.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="space-y-3">
                  <div>
                    <button
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                      className="text-lg font-semibold text-primary hover:underline cursor-pointer"
                    >
                      {user.username}
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Email: </span>
                      <span className="text-gray-900 dark:text-gray-100">{user.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone: </span>
                      <span className="text-gray-900 dark:text-gray-100">{user.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Role: </span>
                      <Chip
                        color={getRoleColor(user.role)}
                        size="sm"
                        variant="flat"
                      >
                        {user.role}
                      </Chip>
                    </div>
                    <div>
                      <span className="text-gray-500">Created: </span>
                      <span className="text-gray-900 dark:text-gray-100">{formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      onPress={() => onEdit(user)}
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      onPress={() => onDelete(user.id)}
                      className="flex-1"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardBody>
    </Card>
  );
}
