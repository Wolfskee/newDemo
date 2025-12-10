"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Image } from "@nextui-org/react";
import Link from "next/link";
import { apiUrl } from "@/lib/api-config";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(apiUrl("api/products"));
      const data = await response.json();
      if (data.success) {
        // Show only first 3 products on homepage
        setProducts(data.products.slice(0, 3) || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  if (products.length === 0) {
    return null;
  }

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
