"use client";

import { Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Image, Button } from "@heroui/react";
import { Item } from "@/types/api";

interface ProductsTableCardProps {
  products: Item[];
  onEdit: (product: Item) => void;
  onDelete: (id: string) => void;
}

export default function ProductsTableCard({ products, onEdit, onDelete }: ProductsTableCardProps) {
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
          <TableBody emptyContent="No products found">
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={60}
                    height={60}
                    className="object-cover rounded"
                  />
                </TableCell>
                <TableCell className="font-semibold">{product.name}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {product.description}
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  ${product.price.toFixed(2)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      onPress={() => onEdit(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      onPress={() => onDelete(product.id)}
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
