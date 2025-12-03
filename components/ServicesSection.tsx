import { Card, CardBody } from "@nextui-org/react";
import Link from "next/link";

const services = [
  {
    id: 1,
    name: "Consulting Services",
    description:
      "Expert consulting to help your business grow and succeed with tailored solutions.",
    icon: "💼",
  },
  {
    id: 2,
    name: "Technical Support",
    description:
      "24/7 technical support to ensure your systems run smoothly and efficiently.",
    icon: "🔧",
  },
  {
    id: 3,
    name: "Custom Solutions",
    description:
      "Bespoke solutions designed specifically for your unique business requirements.",
    icon: "⚙️",
  },
];

export default function ServicesSection() {
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
