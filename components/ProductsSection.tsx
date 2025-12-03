import { Card, CardBody, CardHeader, Image } from "@nextui-org/react";
import Link from "next/link";

const products = [
  {
    id: 1,
    name: "Premium Product 1",
    description: "High-quality product designed for excellence",
    price: "$99.99",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
  },
  {
    id: 2,
    name: "Premium Product 2",
    description: "Innovative solution for modern needs",
    price: "$149.99",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
  },
  {
    id: 3,
    name: "Premium Product 3",
    description: "Cutting-edge technology at your fingertips",
    price: "$199.99",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
  },
];

export default function ProductsSection() {
  return (
    <section className="py-20 px-4 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Our Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="hover:scale-105 transition-transform">
              <CardHeader className="p-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  width="100%"
                  height={200}
                  className="object-cover"
                />
              </CardHeader>
              <CardBody>
                <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary">
                    {product.price}
                  </span>
                  <Link
                    href="/products"
                    className="text-primary hover:underline"
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
            href="/products"
            className="text-lg text-primary hover:underline font-semibold"
          >
            View All Products →
          </Link>
        </div>
      </div>
    </section>
  );
}
