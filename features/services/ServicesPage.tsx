"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Image, Button } from "@heroui/react";
import { apiGet } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { Item, ItemListResponse } from "@/types/api";

export default function ServicesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [services, setServices] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data: ItemListResponse = await apiGet<ItemListResponse>("item");
      // 只显示 duration > 0 的 items（services）
      const serviceItems = (data.items || []).filter(
        (item) => item.duration && item.duration > 0
      );
      setServices(serviceItems);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching services:", error);
      setError("Failed to load services. Please try again later.");
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (user) {
      // 已登录，跳转到 profile 页面的 booking form
      router.push("/profile#booking");
    } else {
      // 未登录，跳转到登录页面
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 flex items-center justify-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  // 只显示状态为 ACTIVE 的服务
  const activeServices = services.filter(
    (service) => !service.status || service.status === "ACTIVE"
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Our Services
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 text-lg">
          Explore our comprehensive range of professional services
        </p>
        {activeServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeServices.map((service) => (
              <Card key={service.id} className="hover:shadow-xl transition-shadow">
                <CardHeader className="p-0">
                  <Image
                    src={service.imageUrl}
                    alt={service.name}
                    width="100%"
                    height={300}
                    className="object-cover"
                  />
                </CardHeader>
                <CardBody className="p-6">
                  <h2 className="text-2xl font-semibold mb-3">{service.name}</h2>
                  {service.category && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {service.category}
                    </p>
                  )}
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {service.description}
                  </p>
                  {service.duration && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Duration: {service.duration} minutes
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-3xl font-bold text-primary">
                      ${service.price.toFixed(2)}
                    </span>
                    <Button
                      color="primary"
                      onPress={handleBookNow}
                      className="px-6 py-2"
                    >
                      Book Now
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No services available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
