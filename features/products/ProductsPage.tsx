"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Image } from "@nextui-org/react";
import { apiUrl } from "@/lib/api-config";
import { Item, ItemListResponse } from "@/types/api";

export default function ProductsPage() {
  const [products, setProducts] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(apiUrl("item"));
      
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data: ItemListResponse = await response.json();
      // 只显示 duration === 0 或未定义的 items（products）
      const productItems = (data.items || []).filter(
        (item) => !item.duration || item.duration === 0
      );
      setProducts(productItems);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again later.");
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

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 flex items-center justify-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  // 只显示状态为 ACTIVE 的产品
  const activeProducts = products.filter(
    (product) => !product.status || product.status === "ACTIVE"
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Our Products
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 text-lg">
          Discover our wide range of premium products
        </p>
        {activeProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-xl transition-shadow">
                <CardHeader className="p-0">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width="100%"
                    height={300}
                    className="object-cover"
                  />
                </CardHeader>
                <CardBody className="p-6">
                  <h2 className="text-2xl font-semibold mb-3">{product.name}</h2>
                  {product.category && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {product.category}
                    </p>
                  )}
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-3xl font-bold text-primary">
                      ${product.price.toFixed(2)}
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
