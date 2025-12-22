"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { Item, ItemListResponse } from "@/types/api";
import NoServicesAlert from "./components/NoServiceAlert";
import ServicesError from "./components/ServicesError";
import ServicesHeader from "./components/ServiceHeader";
import ServicesCard from "./components/ServicesCard";

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
        <ServicesHeader />
        {activeServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeServices.map((service) => (
              <ServicesCard key={service.id} service={service} handleBookNow={handleBookNow} />
            ))}
          </div>
        ) : (
          <ServicesError message={error} onRetry={fetchServices} />
        )}
        {activeServices.length === 0 && (
          <NoServicesAlert />
        )}
      </div>
    </div>
  );
}
