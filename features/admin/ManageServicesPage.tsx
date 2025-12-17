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
import ServicesTableCard from "./components/ServicesTableCard";

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

  useEffect(() => {
    const stored = localStorage.getItem("adminUser");
    if (!stored) {
      router.push("/admin");
    } else {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Manage Services
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Add, edit, or remove services
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
            <Button color="secondary" onPress={() => handleOpenModal()}>
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
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
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
                      <SelectItem key="ACTIVE" value="ACTIVE">
                        ACTIVE
                      </SelectItem>
                      <SelectItem key="INACTIVE" value="INACTIVE">
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
                <ModalFooter>
                  <Button variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="secondary"
                    onPress={handleSubmit}
                    isLoading={isSubmitting}
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
  );
}
