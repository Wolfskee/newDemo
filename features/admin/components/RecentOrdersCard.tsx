"use client";

import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip } from "@heroui/react";

interface Order {
  id: number;
  customer: string;
  product: string;
  status: string;
  date: string;
}

interface RecentOrdersCardProps {
  orders: Order[];
}

export default function RecentOrdersCard({ orders }: RecentOrdersCardProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-semibold">Recent Orders</h2>
      </CardHeader>
      <CardBody>
        <Table aria-label="Recent orders table">
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>CUSTOMER</TableColumn>
            <TableColumn>PRODUCT</TableColumn>
            <TableColumn>STATUS</TableColumn>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.product}</TableCell>
                <TableCell>
                  <Chip
                    color={
                      order.status === "Completed"
                        ? "success"
                        : order.status === "Pending"
                        ? "warning"
                        : "primary"
                    }
                    size="sm"
                  >
                    {order.status}
                  </Chip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}
