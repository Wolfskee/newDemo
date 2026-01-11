"use client";

import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Button } from "@heroui/react";
import { User } from "@/types/api";
import { useRouter } from "next/navigation";

interface EmployeesTableCardProps {
  employees: User[];
  onEdit: (employee: User) => void;
  onDelete: (id: string) => void;
}

export default function EmployeesTableCard({ employees, onEdit, onDelete }: EmployeesTableCardProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl md:text-2xl font-semibold">
            Employees ({employees.length})
          </h2>
        </div>
      </CardHeader>
      <CardBody>
        {/* 桌面端表格 */}
        <div className="hidden md:block">
          <Table aria-label="Employees table">
            <TableHeader>
              <TableColumn>USERNAME</TableColumn>
              <TableColumn>EMAIL</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>CREATED AT</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No employees found">
              {employees.map((employee) => (
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
                      {employee.username || employee.email}
                    </button>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() =>
                        router.push(
                          `/admin/employees/${encodeURIComponent(employee.email)}`
                        )
                      }
                      className="text-foreground hover:underline cursor-pointer"
                    >
                      {employee.email}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color="warning">
                      EMPLOYEE
                    </Chip>
                  </TableCell>
                  <TableCell>{formatDate(employee.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => onEdit(employee)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => onDelete(employee.id)}
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
          {employees.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No employees found</p>
          ) : (
            employees.map((employee) => (
              <Card key={employee.id} className="p-4">
                <div className="space-y-3">
                  <div>
                    <button
                      onClick={() =>
                        router.push(
                          `/admin/employees/${encodeURIComponent(employee.email)}`
                        )
                      }
                      className="text-lg font-semibold text-primary hover:underline cursor-pointer"
                    >
                      {employee.username || employee.email}
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Email: </span>
                      <button
                        onClick={() =>
                          router.push(
                            `/admin/employees/${encodeURIComponent(employee.email)}`
                          )
                        }
                        className="text-foreground hover:underline cursor-pointer"
                      >
                        {employee.email}
                      </button>
                    </div>
                    <div>
                      <span className="text-gray-500">Role: </span>
                      <Chip size="sm" variant="flat" color="warning">
                        EMPLOYEE
                      </Chip>
                    </div>
                    <div>
                      <span className="text-gray-500">Created: </span>
                      <span className="text-gray-900 dark:text-gray-100">{formatDate(employee.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      onPress={() => onEdit(employee)}
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      onPress={() => onDelete(employee.id)}
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
