"use client";

import { useEffect } from "react";
import { useServicesStore } from "./store/useServicesStore";
import NoServicesAlert from "./components/NoServiceAlert";
import ServicesError from "./components/ServicesError";
import ServicesHeader from "./components/ServiceHeader";
import ServicesCard from "./components/ServicesCard";
import ServicesLoadingSkeleton from "./components/ServicesLoadingSkeleton";
import { useHandleBookNow } from "./hooks/useHandleBookNow";

export default function ServicesPage() {
  // 使用 services store
  const services = useServicesStore((state) => state.services);
  const loading = useServicesStore((state) => state.loading);
  const error = useServicesStore((state) => state.error);
  const fetchServices = useServicesStore((state) => state.fetchServices);
  const getActiveServices = useServicesStore((state) => state.getActiveServices);

  // Local hooks
  const { handleBookNow } = useHandleBookNow();

  // fetch services
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  if (loading) {
    return <ServicesLoadingSkeleton />;
  }

  if (error) {
    return <ServicesError message={error} onRetry={fetchServices} />;
  }

  // 只显示状态为 ACTIVE 的服务
  const activeServices = getActiveServices();

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
          <NoServicesAlert />
        )}
      </div>
    </div>
  );
}
