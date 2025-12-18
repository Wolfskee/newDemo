"use client";

import { Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Image, Button } from "@nextui-org/react";
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
      </CardBody>
    </Card>
  );
}
