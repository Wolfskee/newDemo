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
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";
import { Item, ItemListResponse } from "@/types/api";
import ServicesTableCard from "./components/ServicesTableCard";
import QuickActionsCard from "./components/QuickActionsCard";

export default function ManageServicesPage() {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [services, setServices] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Item | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "",
    status: "ACTIVE",
    imageUrl: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
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
      fetchServices();
    }
  }, [router]);

  const fetchServices = async () => {
    try {
      const data: ItemListResponse = await apiGet<ItemListResponse>("item");
      // 只获取 services (duration > 0)
      const serviceItems = (data.items || []).filter(
        (item) => item.duration && item.duration > 0
      );
      setServices(serviceItems);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching services:", error);
      setLoading(false);
    }
  };

  const handleOpenModal = (service?: Item) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description,
        price: service.price.toString(),
        duration: (service.duration || 0).toString(),
        category: service.category || "",
        status: service.status || "ACTIVE",
        imageUrl: service.imageUrl,
      });
      setImagePreview(service.imageUrl);
    } else {
      setEditingService(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        duration: "",
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

    if (!formData.duration || parseFloat(formData.duration) <= 0) {
      alert("Duration must be greater than 0 for services");
      return;
    }

    setIsSubmitting(true);
    try {
      const body = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        category: formData.category || "Service",
        status: formData.status,
        imageUrl: formData.imageUrl,
      };

      if (editingService) {
        await apiPut(`item/${editingService.id}`, body);
      } else {
        await apiPost("item", body);
      }

      await fetchServices();
      onOpenChange();
      setFormData({
        name: "",
        description: "",
        price: "",
        duration: "",
        category: "",
        status: "ACTIVE",
        imageUrl: "",
      });
      setImagePreview("");
      setEditingService(null);
    } catch (error) {
      console.error("Error saving service:", error);
      alert(error instanceof Error ? error.message : "Failed to save service");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      await apiDelete(`item/${id}`);
      await fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      alert(error instanceof Error ? error.message : "Failed to delete service");
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
              Manage Services
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 md:mt-2">
              Add, edit, or remove services
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
              color="secondary" 
              onPress={() => handleOpenModal()}
              size="sm"
              className="w-full sm:w-auto"
            >
              + Add Service
            </Button>
          </div>
        </div>

        <ServicesTableCard
          services={services}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
        />

        {/* Add/Edit Service Modal */}
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange} 
          size="2xl" 
          scrollBehavior="inside"
          classNames={{
            base: "max-w-[95vw] sm:max-w-2xl",
            body: "py-4 sm:py-6",
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  {editingService ? "Edit Service" : "Add New Service"}
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <Input
                      label="Service Name"
                      placeholder="Enter service name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      isRequired
                      fullWidth
                    />

                    <Textarea
                      label="Description"
                      placeholder="Enter service description"
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
                      placeholder="e.g., 45.99"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      isRequired
                      fullWidth
                    />

                    <Input
                      label="Duration (minutes)"
                      type="number"
                      placeholder="e.g., 30"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      isRequired
                      description="Duration must be greater than 0"
                      fullWidth
                    />

                    <Input
                      label="Category"
                      placeholder="e.g., Service"
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

                    <Input
                      label="Image URL"
                      placeholder="https://example.com/images/service.jpg"
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
                <ModalFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                  <Button 
                    variant="light" 
                    onPress={onClose}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    color="secondary"
                    onPress={handleSubmit}
                    isLoading={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {editingService ? "Update" : "Create"}
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
