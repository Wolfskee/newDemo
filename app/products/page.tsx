import { Card, CardBody, CardHeader, Image } from "@nextui-org/react";

const products = [
  {
    id: 1,
    name: "Premium Product 1",
    description:
      "High-quality product designed for excellence. This product offers outstanding performance and reliability.",
    price: "$99.99",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    features: ["Feature 1", "Feature 2", "Feature 3"],
  },
  {
    id: 2,
    name: "Premium Product 2",
    description:
      "Innovative solution for modern needs. Built with cutting-edge technology.",
    price: "$149.99",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    features: ["Feature A", "Feature B", "Feature C"],
  },
  {
    id: 3,
    name: "Premium Product 3",
    description:
      "Cutting-edge technology at your fingertips. Experience the future today.",
    price: "$199.99",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
    features: ["Feature X", "Feature Y", "Feature Z"],
  },
  {
    id: 4,
    name: "Premium Product 4",
    description: "Professional grade solution for businesses of all sizes.",
    price: "$249.99",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    features: ["Enterprise Feature 1", "Enterprise Feature 2"],
  },
];

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Our Products
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 text-lg">
          Discover our wide range of premium products
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-xl transition-shadow">
              <CardHeader className="p-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  width="100%"
                  height={300}
                  className="object-cover"
                />
              </CardHeader>
              <CardBody className="p-6">
                <h2 className="text-2xl font-semibold mb-3">{product.name}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {product.description}
                </p>
                <ul className="list-disc list-inside mb-4 text-gray-600 dark:text-gray-400">
                  {product.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold text-primary">
                    {product.price}
                  </span>
                  <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors">
                    Add to Cart
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
