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
  Chip,
  Image,
} from "@nextui-org/react";
import { apiUrl } from "@/lib/api-config";
import { Service } from "@/types/api";
import ServicesTableCard from "./components/ServicesTableCard";

export default function ManageServicesPage() {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    image: "",
    features: [] as string[],
  });
  const [newFeature, setNewFeature] = useState("");
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
      const response = await fetch(apiUrl("api/services"));
      const data = await response.json();
      if (data.success) {
        setServices(data.services || []);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching services:", error);
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

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description,
        icon: service.icon,
        image: service.image || "",
        features: service.features || [],
      });
      setImagePreview(service.image || "");
    } else {
      setEditingService(null);
      setFormData({
        name: "",
        description: "",
        icon: "",
        image: "",
        features: [],
      });
      setImagePreview("");
    }
    setNewFeature("");
    onOpen();
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.icon) {
      alert("Please fill in all required fields (name, description, icon)");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = apiUrl("api/services");
      const method = editingService ? "PUT" : "POST";
      const body = editingService
        ? { id: editingService.id, ...formData }
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
        await fetchServices();
        onOpenChange();
        setFormData({ name: "", description: "", icon: "", image: "", features: [] });
        setImagePreview("");
        setEditingService(null);
        setNewFeature("");
      } else {
        alert(data.error || "Failed to save service");
      }
    } catch (error) {
      console.error("Error saving service:", error);
      alert("Failed to save service");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      const response = await fetch(apiUrl(`api/services?id=${id}`), {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        await fetchServices();
      } else {
        alert(data.error || "Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Failed to delete service");
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
                      label="Icon (Emoji)"
                      placeholder="e.g., 💼 🔧 ⚙️ 📚"
                      value={formData.icon}
                      onChange={(e) =>
                        setFormData({ ...formData, icon: e.target.value })
                      }
                      isRequired
                      description="Enter an emoji to represent this service"
                      fullWidth
                    />

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Service Image (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-secondary-600"
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

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Features
                      </label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="Enter a feature"
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddFeature();
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          color="secondary"
                          variant="flat"
                          onPress={handleAddFeature}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.features.map((feature, index) => (
                          <Chip
                            key={index}
                            onClose={() => handleRemoveFeature(index)}
                            variant="flat"
                            color="secondary"
                          >
                            {feature}
                          </Chip>
                        ))}
                      </div>
                    </div>
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
