"use client";

import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Button } from "@nextui-org/react";
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
          <h2 className="text-2xl font-semibold">
            Employees ({employees.length})
          </h2>
        </div>
      </CardHeader>
      <CardBody>
        <Table aria-label="Employees table">
          <TableHeader>
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
      </CardBody>
    </Card>
  );
}
