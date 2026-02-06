"use client";

import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip } from "@heroui/react";
import { useRecentOrdersStore } from "../store/useRecentOrdersStore";

export default function RecentOrdersCard() {
  const { recentOrders } = useRecentOrdersStore();
  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-semibold">Recent Orders</h2>
      </CardHeader>
      <CardBody>
        <div className="overflow-x-auto">
          <Table aria-label="Recent orders table">
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>CUSTOMER</TableColumn>
              <TableColumn>PRODUCT</TableColumn>
              <TableColumn>STATUS</TableColumn>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
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
                            : order.status === "Cancelled"
                              ? "danger"
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
        </div>
      </CardBody>
    </Card>
  );
}
