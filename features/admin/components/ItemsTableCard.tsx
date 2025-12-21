"use client";

import { Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Image, Button } from "@heroui/react";
import { Item } from "@/types/api";

type ItemType = "product" | "service";

interface ItemsTableCardProps {
  items: Item[];
  itemType: ItemType;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
}

export default function ItemsTableCard({ items, itemType, onEdit, onDelete }: ItemsTableCardProps) {
  // 为 products 渲染的表格
  if (itemType === "product") {
    return (
      <Card>
        <CardBody>
          <Table aria-label="Products table">
            <TableHeader>
              <TableColumn>IMAGE</TableColumn>
              <TableColumn>NAME</TableColumn>
              <TableColumn>DESCRIPTION</TableColumn>
              <TableColumn>PRICE</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {items.length > 0 ? (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={60}
                        height={60}
                        className="object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-semibold">{item.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.description}
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      ${item.price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={() => onEdit(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          onPress={() => onDelete(item.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-gray-500">No products found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    );
  }

  // 为 services 渲染的表格
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
          <TableBody>
            {items.length > 0 ? (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={60}
                      height={60}
                      className="object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-semibold">{item.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {item.description}
                  </TableCell>
                  <TableCell>{item.duration} min</TableCell>
                  <TableCell className="font-semibold text-primary">
                    ${item.price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => onEdit(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => onDelete(item.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-gray-500">No services found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}
