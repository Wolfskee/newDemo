import { Card, CardBody } from "@nextui-org/react";

const services = [
  {
    id: 1,
    name: "Consulting Services",
    description:
      "Expert consulting to help your business grow and succeed with tailored solutions. Our team of experienced consultants will work closely with you to identify opportunities and implement strategies that drive results.",
    icon: "💼",
    features: [
      "Strategic Planning",
      "Business Analysis",
      "Implementation Support",
    ],
  },
  {
    id: 2,
    name: "Technical Support",
    description:
      "24/7 technical support to ensure your systems run smoothly and efficiently. Our dedicated support team is always ready to help you resolve any technical issues quickly and effectively.",
    icon: "🔧",
    features: ["24/7 Availability", "Expert Technicians", "Quick Response"],
  },
  {
    id: 3,
    name: "Custom Solutions",
    description:
      "Bespoke solutions designed specifically for your unique business requirements. We create tailored solutions that perfectly fit your needs and help you achieve your business goals.",
    icon: "⚙️",
    features: ["Custom Development", "Tailored Design", "Ongoing Support"],
  },
  {
    id: 4,
    name: "Training & Education",
    description:
      "Comprehensive training programs to help your team master new technologies and best practices. We offer both on-site and online training options.",
    icon: "📚",
    features: ["On-site Training", "Online Courses", "Certification Programs"],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Our Services
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 text-lg">
          Explore our comprehensive range of professional services
        </p>
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
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Key Features:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    {service.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-center">
                  <button className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors">
                    Contact Us
                  </button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
