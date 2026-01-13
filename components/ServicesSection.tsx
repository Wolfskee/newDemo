"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, Image } from "@heroui/react";
import Link from "next/link";
import { apiGet } from "@/lib/api-client";
import { Item, ItemListResponse } from "@/types/api";

export default function ServicesSection() {
  const [services, setServices] = useState<Item[]>([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data: ItemListResponse = await apiGet<ItemListResponse>("item", { skipAuth: true });
      // 过滤出 services (duration > 0) 且状态为 ACTIVE
      const serviceItems = (data.items || []).filter(
        (item) => item.duration && item.duration > 0 && (!item.status || item.status === "ACTIVE")
      );
      // Show only first 3 services on homepage
      setServices(serviceItems.slice(0, 3));
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  if (services.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 bg-gray-800">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-white">
          Our Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardBody className="p-8">
                {service.imageUrl && (
                  <div className="mb-4 flex justify-center items-center min-h-[200px]">
                    <Image
                      src={service.imageUrl}
                      alt={service.name}
                      className="max-w-full max-h-[200px] object-contain rounded-lg"
                    />
                  </div>
                )}
                <h3 className="text-2xl font-semibold mb-4 text-center text-white">
                  {service.name}
                </h3>
                <p className="text-gray-400 text-center mb-4">
                  {service.description}
                </p>
                {service.duration && (
                  <p className="text-sm text-gray-500 text-center mb-2">
                    Duration: {service.duration} minutes
                  </p>
                )}
                <p className="text-lg font-bold text-primary text-center mb-4">
                  ${service.price.toFixed(2)}
                </p>
                <div className="text-center">
                  <Link
                    href="/services"
                    className="text-primary hover:underline font-semibold"
                  >
                    Learn More →
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            href="/services"
            className="text-lg text-primary hover:underline font-semibold"
          >
            View All Services →
          </Link>
        </div>
      </div>
    </section>
  );
}
