"use client";

import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Button } from "@nextui-org/react";
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
          <h2 className="text-2xl font-semibold">
            Users ({users.length})
          </h2>
        </div>
      </CardHeader>
      <CardBody>
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
      </CardBody>
    </Card>
  );
}
