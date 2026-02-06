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
} from "@heroui/react";
import { apiGet, apiPost, apiPut, apiDelete, apiUploadFile } from "@/lib/api-client";
import { Item, ItemListResponse } from "@/types/api";
import ProductsTableCard from "./components/ProductsTableCard";
import QuickActionsCard from "./components/QuickActionsCard";

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminUser, setAdminUser] = useState<{ email: string; role: string } | null>(null);
  const [isNavExpanded, setIsNavExpanded] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("adminUser");
    if (!stored) {
      router.push("/admin");
    } else {
      const user = JSON.parse(stored);
      setAdminUser(user);
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
      setImageFile(null);
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
      setImageFile(null);
    }
    onOpen();
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // 创建预览 URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // 清除 URL 输入
      setFormData({ ...formData, imageUrl: "" });
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.price) {
      alert("Please fill in all required fields");
      return;
    }

    if (!imageFile && !formData.imageUrl) {
      alert("Please provide either an image file or image URL");
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
        imageUrl: formData.imageUrl || "", // 如果有文件，imageUrl 将稍后更新
      };

      let productId: string;

      if (editingProduct) {
        // 编辑现有商品
        await apiPut(`item/${editingProduct.id}`, body);
        productId = editingProduct.id;

        // 如果有新图片文件，上传图片
        if (imageFile) {
          await apiUploadFile(`item/image/${productId}`, imageFile, { fieldName: "image" });
        }
      } else {
        // 创建新商品
        const newProduct = await apiPost<Item>("item", body);
        productId = newProduct.id;

        // 如果有图片文件，上传图片
        if (imageFile) {
          await apiUploadFile(`item/image/${productId}`, imageFile, { fieldName: "image" });
        } else if (formData.imageUrl) {
          // 如果使用 URL，可能需要更新商品信息以包含 imageUrl
          // 这取决于后端是否会在创建时接受 imageUrl
        }
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
      setImageFile(null);
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

  const handleDeleteImage = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product image?")) {
      return;
    }

    try {
      await apiDelete(`item/image/${productId}`);
      await fetchProducts();
      alert("Product image deleted successfully");
    } catch (error) {
      console.error("Error deleting product image:", error);
      alert(error instanceof Error ? error.message : "Failed to delete product image");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* 左侧导航栏 */}
      <QuickActionsCard
        adminUser={adminUser}
        isExpanded={isNavExpanded}
        onToggle={() => setIsNavExpanded(!isNavExpanded)}
      />

      {/* 主内容区 */}
      <main
        className={`
          flex-1 transition-all duration-300 ease-in-out
          lg:${isNavExpanded ? 'ml-64' : 'ml-20'}
        `}
      >
        <div className="py-4 md:py-8 px-3 sm:px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8 gap-4">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Manage Products
                </h1>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 md:mt-2">
                  Add, edit, or remove products
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  color="default"
                  variant="flat"
                  onPress={() => router.push("/admin/dashboard")}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  ← Back
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleOpenModal()}
                  size="sm"
                  className="w-full sm:w-auto"
                >
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
            <Modal
              isOpen={isOpen}
              onOpenChange={onOpenChange}
              size="2xl"
              scrollBehavior="inside"
              placement="top"
              classNames={{
                base: "max-w-[95vw] sm:max-w-2xl my-2 sm:my-8",
                body: "py-4 sm:py-6",
              }}
            >
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
                          <SelectItem key="ACTIVE">
                            ACTIVE
                          </SelectItem>
                          <SelectItem key="INACTIVE">
                            INACTIVE
                          </SelectItem>
                        </Select>

                        <div className="space-y-3">
                          <label className="block text-sm font-medium">
                            Product Image <span className="text-danger">*</span>
                          </label>

                          {/* 文件上传 */}
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageFileChange}
                              className="hidden"
                              id="product-image-input"
                            />
                            <label htmlFor="product-image-input">
                              <Button
                                as="span"
                                size="sm"
                                variant="flat"
                                color="primary"
                                className="cursor-pointer"
                                isDisabled={isSubmitting}
                              >
                                {imageFile ? "Change Image File" : "Upload Image File"}
                              </Button>
                            </label>
                            {imageFile && (
                              <p className="text-xs text-gray-500 mt-1">
                                Selected: {imageFile.name}
                              </p>
                            )}
                          </div>

                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-gray-50 dark:bg-gray-900 px-2 text-gray-500">
                                Or
                              </span>
                            </div>
                          </div>

                          {/* URL 输入 */}
                          <Input
                            label="Image URL"
                            placeholder="https://example.com/images/product.jpg"
                            value={formData.imageUrl}
                            onChange={(e) => {
                              setFormData({ ...formData, imageUrl: e.target.value });
                              setImagePreview(e.target.value);
                              setImageFile(null); // 清除文件选择
                            }}
                            isDisabled={!!imageFile}
                            fullWidth
                          />
                        </div>

                        {imagePreview && (
                          <div className="mt-4 space-y-2">
                            <Image
                              src={imagePreview}
                              alt="Preview"
                              width={200}
                              height={200}
                              className="object-cover rounded"
                            />
                            {editingProduct && editingProduct.imageUrl && !imageFile && (
                              <Button
                                size="sm"
                                variant="flat"
                                color="danger"
                                onPress={() => handleDeleteImage(editingProduct.id)}
                                isDisabled={isSubmitting}
                              >
                                Delete Current Image
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </ModalBody>
                    <ModalFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                      <Button
                        variant="light"
                        onPress={onClose}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button
                        color="primary"
                        onPress={handleSubmit}
                        isLoading={isSubmitting}
                        className="w-full sm:w-auto"
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
      </main>
    </div>
  );
}
