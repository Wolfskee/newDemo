"use client";

import { Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Image, Button } from "@nextui-org/react";
import { Product } from "@/types/api";

interface ProductsTableCardProps {
  products: Product[];
  onEdit: (product: Product) => void;
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
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Image
                    src={product.image}
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
                  {product.price}
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
