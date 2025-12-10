"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Image } from "@nextui-org/react";
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(apiUrl("api/products"));
      const data = await response.json();
      if (data.success) {
        setProducts(data.products || []);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Our Products
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 text-lg">
          Discover our wide range of premium products
        </p>
        {products.length > 0 ? (
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
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No products available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
