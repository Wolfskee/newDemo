"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Textarea,
  Image,
} from "@nextui-org/react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export default function ManageProductsPage() {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check for admin session
    const stored = localStorage.getItem("adminUser");
    if (!stored) {
      router.push("/admin");
    } else {
      fetchProducts();
    }
  }, [router]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      if (data.success) {
        setProducts(data.products || []);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, image: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
      });
      setImagePreview(product.image);
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        image: "",
      });
      setImagePreview("");
    }
    onOpen();
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.price || !formData.image) {
      alert("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = "/api/products";
      const method = editingProduct ? "PUT" : "POST";
      const body = editingProduct
        ? { id: editingProduct.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        await fetchProducts();
        onOpenChange();
        setFormData({ name: "", description: "", price: "", image: "" });
        setImagePreview("");
        setEditingProduct(null);
      } else {
        alert(data.error || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        await fetchProducts();
      } else {
        alert(data.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Manage Products
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Add, edit, or remove products
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              color="default"
              variant="flat"
              onPress={() => router.push("/admin/dashboard")}
            >
              ← Back to Dashboard
            </Button>
            <Button color="primary" onPress={() => handleOpenModal()}>
              + Add Product
            </Button>
          </div>
        </div>

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
                          onPress={() => handleOpenModal(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          onPress={() => handleDelete(product.id)}
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

        {/* Add/Edit Product Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <Input
                      label="Product Name"
                      placeholder="Enter product name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      isRequired
                      fullWidth
                    />

                    <Textarea
                      label="Description"
                      placeholder="Enter product description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      isRequired
                      minRows={3}
                      fullWidth
                    />

                    <Input
                      label="Price"
                      placeholder="e.g., $99.99"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      isRequired
                      fullWidth
                    />

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Product Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-600"
                      />
                      {imagePreview && (
                        <div className="mt-4">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            width={200}
                            height={200}
                            className="object-cover rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleSubmit}
                    isLoading={isSubmitting}
                  >
                    {editingProduct ? "Update" : "Create"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
