"use client";

import { Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Button } from "@nextui-org/react";
import { Service } from "@/types/api";

interface ServicesTableCardProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
}

export default function ServicesTableCard({ services, onEdit, onDelete }: ServicesTableCardProps) {
  return (
    <Card>
      <CardBody>
        <Table aria-label="Services table">
          <TableHeader>
            <TableColumn>ICON</TableColumn>
            <TableColumn>NAME</TableColumn>
            <TableColumn>DESCRIPTION</TableColumn>
            <TableColumn>FEATURES</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>
                  <div className="text-4xl">{service.icon}</div>
                </TableCell>
                <TableCell className="font-semibold">{service.name}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {service.description}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {service.features.slice(0, 2).map((feature, idx) => (
                      <Chip key={idx} size="sm" variant="flat">
                        {feature}
                      </Chip>
                    ))}
                    {service.features.length > 2 && (
                      <Chip size="sm" variant="flat">
                        +{service.features.length - 2}
                      </Chip>
                    )}
                  </div>
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
