"use client";

import { Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Image, Button } from "@heroui/react";
import { Item } from "@/types/api";

interface ServicesTableCardProps {
  services: Item[];
  onEdit: (service: Item) => void;
  onDelete: (id: string) => void;
}

export default function ServicesTableCard({ services, onEdit, onDelete }: ServicesTableCardProps) {
  return (
    <Card>
      <CardBody>
        {/* 桌面端表格 */}
        <div className="hidden md:block">
          <Table aria-label="Services table">
            <TableHeader>
              <TableColumn>IMAGE</TableColumn>
              <TableColumn>NAME</TableColumn>
              <TableColumn>DESCRIPTION</TableColumn>
              <TableColumn>DURATION</TableColumn>
              <TableColumn>PRICE</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No services found">
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <Image
                      src={service.imageUrl}
                      alt={service.name}
                      width={60}
                      height={60}
                      className="object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-semibold">{service.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {service.description}
                  </TableCell>
                  <TableCell>{service.duration} min</TableCell>
                  <TableCell className="font-semibold text-primary">
                    ${service.price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => onEdit(service)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => onDelete(service.id)}
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
          {services.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No services found</p>
          ) : (
            services.map((service) => (
              <Card key={service.id} className="p-4">
                <div className="flex gap-4">
                  <Image
                    src={service.imageUrl}
                    alt={service.name}
                    width={80}
                    height={80}
                    className="object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="font-semibold text-lg">{service.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {service.description}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        Duration: {service.duration} min
                      </span>
                      <span className="font-semibold text-primary text-lg">
                        ${service.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => onEdit(service)}
                        className="flex-1"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => onDelete(service.id)}
                        className="flex-1"
                      >
                        Delete
                      </Button>
                    </div>
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
