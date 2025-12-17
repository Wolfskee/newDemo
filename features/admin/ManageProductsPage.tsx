"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Textarea,
  Image,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";
import { Item, ItemListResponse } from "@/types/api";
import ProductsTableCard from "./components/ProductsTableCard";

export default function ManageProductsPage() {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [products, setProducts] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Item | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "0",
    category: "",
    status: "ACTIVE",
    imageUrl: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("adminUser");
    if (!stored) {
      router.push("/admin");
    } else {
      fetchProducts();
    }
  }, [router]);

  const fetchProducts = async () => {
    try {
      const data: ItemListResponse = await apiGet<ItemListResponse>("item");
      // 只获取 products (duration === 0 或未定义)
      const productItems = (data.items || []).filter(
        (item) => !item.duration || item.duration === 0
      );
      setProducts(productItems);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  const handleOpenModal = (product?: Item) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        duration: (product.duration || 0).toString(),
        category: product.category || "",
        status: product.status || "ACTIVE",
        imageUrl: product.imageUrl,
      });
      setImagePreview(product.imageUrl);
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        duration: "0",
        category: "",
        status: "ACTIVE",
        imageUrl: "",
      });
      setImagePreview("");
    }
    onOpen();
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.price || !formData.imageUrl) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const body = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        category: formData.category || "Product",
        status: formData.status,
        imageUrl: formData.imageUrl,
      };

      if (editingProduct) {
        await apiPut(`item/${editingProduct.id}`, body);
      } else {
        await apiPost("item", body);
      }

      await fetchProducts();
      onOpenChange();
      setFormData({
        name: "",
        description: "",
        price: "",
        duration: "0",
        category: "",
        status: "ACTIVE",
        imageUrl: "",
      });
      setImagePreview("");
      setEditingProduct(null);
    } catch (error) {
      console.error("Error saving product:", error);
      alert(error instanceof Error ? error.message : "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await apiDelete(`item/${id}`);
      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert(error instanceof Error ? error.message : "Failed to delete product");
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

        <ProductsTableCard
          products={products}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
        />

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
                      type="number"
                      step="0.01"
                      placeholder="e.g., 8.99"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      isRequired
                      fullWidth
                    />

                    <Input
                      label="Duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      isDisabled
                      description="Duration is fixed to 0 for products"
                      fullWidth
                    />

                    <Input
                      label="Category"
                      placeholder="e.g., Product"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      fullWidth
                    />

                    <Select
                      label="Status"
                      selectedKeys={[formData.status]}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        setFormData({ ...formData, status: selected });
                      }}
                      fullWidth
                    >
                      <SelectItem key="ACTIVE" value="ACTIVE">
                        ACTIVE
                      </SelectItem>
                      <SelectItem key="INACTIVE" value="INACTIVE">
                        INACTIVE
                      </SelectItem>
                    </Select>

                    <Input
                      label="Image URL"
                      placeholder="https://example.com/images/product.jpg"
                      value={formData.imageUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, imageUrl: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      isRequired
                      fullWidth
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
