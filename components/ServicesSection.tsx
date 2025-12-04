"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@nextui-org/react";
import Link from "next/link";

interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  image?: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      const data = await response.json();
      if (data.success) {
        // Show only first 3 services on homepage
        setServices(data.services.slice(0, 3) || []);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  if (services.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Our Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardBody className="p-8">
                <div className="text-6xl mb-4 text-center">{service.icon}</div>
                <h3 className="text-2xl font-semibold mb-4 text-center">
                  {service.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                  {service.description}
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
