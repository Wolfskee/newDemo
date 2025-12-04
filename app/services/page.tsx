"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@nextui-org/react";

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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 py-12 px-4 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading services...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Our Services
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 text-lg">
          Explore our comprehensive range of professional services
        </p>
        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service) => (
              <Card key={service.id} className="hover:shadow-xl transition-shadow">
                <CardBody className="p-8">
                  <div className="text-6xl mb-6 text-center">{service.icon}</div>
                  <h2 className="text-3xl font-semibold mb-4 text-center">
                    {service.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
                    {service.description}
                  </p>
                  {service.features && service.features.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3">Key Features:</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                        {service.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="text-center">
                    <button className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors">
                      Contact Us
                    </button>
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
