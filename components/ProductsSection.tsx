"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Image } from "@heroui/react";
import Link from "next/link";
import { apiGet } from "@/lib/api-client";
import { Item, ItemListResponse } from "@/types/api";

export default function ProductsSection() {
  const [products, setProducts] = useState<Item[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data: ItemListResponse = await apiGet<ItemListResponse>("item", { skipAuth: true });
      // 过滤出 products (duration === 0 或未定义) 且状态为 ACTIVE
      const productItems = (data.items || []).filter(
        (item) => (!item.duration || item.duration === 0) && (!item.status || item.status === "ACTIVE")
      );
      // Show only first 3 products on homepage
      setProducts(productItems.slice(0, 3));
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-white">
          Our Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="hover:scale-105 transition-transform">
              <CardHeader className="p-0 flex justify-center items-center bg-default-100 min-h-[200px]">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  className="max-w-full max-h-[200px] object-contain"
                />
              </CardHeader>
              <CardBody>
                <h3 className="text-xl font-semibold mb-2 text-white">{product.name}</h3>
                <p className="text-gray-400 mb-4">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary">
                    ${product.price.toFixed(2)}
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
