"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Image, Button } from "@nextui-org/react";
import { motion, AnimatePresence } from "framer-motion";
import { apiUrl } from "@/lib/api-config";
import { Item, ItemListResponse } from "@/types/api";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

interface FlyingItem {
  id: string;
  product: Item;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export default function ProductsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);

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

  const handleAddToCart = (product: Item, buttonElement: HTMLElement) => {
    if (!user) {
      // 未登录，跳转到登录页面
      router.push("/login");
      return;
    }

    // 获取按钮位置
    const buttonRect = buttonElement.getBoundingClientRect();
    const startX = buttonRect.left + buttonRect.width / 2;
    const startY = buttonRect.top + buttonRect.height / 2;

    // 获取购物车按钮位置
    const cartButton = document.querySelector('[aria-label="Shopping Cart"]') as HTMLElement;
    let endX = window.innerWidth - 80; // 默认位置（右上角）
    let endY = 60; // 默认 Y 位置

    if (cartButton) {
      const cartRect = cartButton.getBoundingClientRect();
      endX = cartRect.left + cartRect.width / 2;
      endY = cartRect.top + cartRect.height / 2;
    }

    // 创建飞行动画项
    const flyingItem: FlyingItem = {
      id: `${product.id}-${Date.now()}`,
      product,
      startX,
      startY,
      endX,
      endY,
    };

    setFlyingItems((prev) => [...prev, flyingItem]);

    // 动画完成后添加到购物车并移除动画项
    setTimeout(() => {
      addToCart(product);
      setFlyingItems((prev) => prev.filter((item) => item.id !== flyingItem.id));
    }, 800); // 动画持续时间
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
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 relative">
      {/* 飞行动画 */}
      <AnimatePresence>
        {flyingItems.map((flyingItem) => (
          <motion.div
            key={flyingItem.id}
            className="fixed z-50 pointer-events-none"
            initial={{
              x: flyingItem.startX - 20,
              y: flyingItem.startY - 20,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              x: flyingItem.endX - 20,
              y: flyingItem.endY - 20,
              scale: 0.3,
              opacity: 0.8,
            }}
            exit={{
              scale: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.8,
              ease: "easeInOut",
            }}
          >
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="white"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

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
                    <Button
                      color="primary"
                      onPress={(e) => {
                        const target = e.target as HTMLElement;
                        const button = target.closest("button") || target;
                        handleAddToCart(product, button as HTMLElement);
                      }}
                    >
                      Add to Cart
                    </Button>
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
